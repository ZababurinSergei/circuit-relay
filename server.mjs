import { createServer, Socket } from 'net';
import http, { IncomingMessage, ServerResponse, request as httpRequest } from 'http';

const HTTP_PORT = 8001;
const PROXY_TCP_PORT = 8002;

const store  = {
    requestBody: '',
    responseBody: '',
};

// const proxy = createServer((localSocket) => {
//     const remoteSocket = new Socket();
//
//     remoteSocket.connect(HTTP_PORT, 'localhost', () => {
//         localSocket.on('data', (chunk) => {
//             remoteSocket.write(chunk);
//         });
//
//         remoteSocket.on('data', (chunk) => {
//             localSocket.write(chunk);
//         });
//
//         localSocket.on('close', () => {
//             remoteSocket.end();
//         });
//
//         remoteSocket.on('close', () => {
//             localSocket.end();
//         });
//     });
// });

const httpServer = http.createServer((req, res) => {
    let data = '';

    req.on('data', (chunk) => {
        data += chunk.toString('utf-8');
    });

    req.on('end', () => {
        store.requestBody = data;
        const content = `Hi there, ${data}`;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', content.length.toString());
        res.write(content);
        res.end();
    });
});

const httpServerListen = () => {
    httpServer.listen(HTTP_PORT, () => {
        console.log(`HTTP server listening on ${HTTP_PORT}`);

        proxyListen();
    });
};

const proxyListen = () => {
    proxy.listen(PROXY_TCP_PORT, () => {
        console.log(`TCP proxy listening on ${PROXY_TCP_PORT}`);

        // httpReq();
    });
};

const httpReq = () => {
    const req = httpRequest({
        port: PROXY_TCP_PORT,
        method: 'POST',
        path: '/greet',
    }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk.toString('utf-8');
        });

        res.on('end', closeConnections);
    });

    const content = 'Joe';
    req.setHeader('Content-Type', 'text/plain');
    req.setHeader('Content-Length', content.length.toString());
    req.write(content);
    req.end();
};

const closeConnections = () => {
    proxy.close();
    httpServer.close();

    console.log(store.requestBody); // Joe

    console.log(store.responseBody); // Hi there, Joe
};

httpServerListen();