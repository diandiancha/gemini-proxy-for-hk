const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const PROXY_SECRET = process.env.PROXY_SECRET;

const verifyRequest = (req, res, next) => {
    const secretFromHeader = req.get('X-Proxy-Secret');

    if (!PROXY_SECRET || secretFromHeader !== PROXY_SECRET) {
        console.warn(`[403 Forbidden] Denied a request with invalid or missing secret.`);
        return res.status(403).send('Forbidden: Access denied.');
    }

    next();
};

app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
});

const target = 'https://generativelanguage.googleapis.com';

const apiProxy = createProxyMiddleware({
    target: target,
    changeOrigin: true,
    ws: false,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.path = req.originalUrl;

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
        res.status(502).send('Bad Gateway: Proxy encountered an error.');
    }
});

app.use('/*', verifyRequest, apiProxy);

app.listen(PORT, () => {
    console.log(`Secure proxy server is running on port ${PORT}`);
});
