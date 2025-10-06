const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

const PROXY_SECRET = process.env.PROXY_SECRET;

const verifyRequest = (req, res, next) => {
    // 从请求头中获取传入的口令
    const secretFromHeader = req.get('X-Proxy-Secret');

    if (!PROXY_SECRET || secretFromHeader !== PROXY_SECRET) {
        console.warn(`[403 Forbidden] Denied a request with invalid or missing secret.`);
        return res.status(403).send('Forbidden: Access denied.');
    }

    next();
};

// 用于 Render 保活
app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
});

// 谷歌 Gemini API 的目标地址
const target = 'https://generativela' + 'nguage.googleapis.com'; 

// 配置代理中间件
const apiProxy = createProxyMiddleware({
    target: target,
    changeOrigin: true,
    ws: false,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.path = req.originalUrl;
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-real-ip');
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(502).send('Bad Gateway: Proxy encountered an error.');
    }
});


app.use('/*', verifyRequest, apiProxy);

app.listen(PORT, () => {
    console.log(`Secure proxy server is running on port ${PORT}`);
});

