const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

const target = 'https://generativelanguage.googleapis.com';

// 配置代理中间件
const apiProxy = createProxyMiddleware({
    target: target,
    changeOrigin: true, 
    ws: false, 
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-real-ip');
        proxyReq.removeHeader('cf-connecting-ip');
        proxyReq.removeHeader('cf-ipcountry');
        proxyReq.removeHeader('cf-ray');
        proxyReq.removeHeader('cf-visitor');
        proxyReq.removeHeader('x-forwarded-proto');
        proxyReq.removeHeader('x-request-id');
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
            'Content-Type': 'text/plain',
        });
        res.end('Something went wrong with the proxy. Please check the logs.');
    }
});

app.use('/', apiProxy);

app.listen(PORT, () => {
    console.log(`Proxy server is successfully running on port ${PORT}`);
});