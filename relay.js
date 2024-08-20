import path from 'path';
import process from "node:process";
import cors from 'cors';
import Enqueue from 'express-enqueue';
import compression from 'compression';
import * as dotenv from 'dotenv';
import express from 'express';

/* eslint-disable no-console */
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'

dotenv.config();
let __dirname = process.cwd();
let whitelist = []

let app = express();

async function main () {


  app.use(compression());
  app.use(express.json());

  const queue = new Enqueue({
    concurrentWorkers: 4,
    maxSize: 200,
    timeout: 30000
  });

  console.log('__dirname', __dirname);

  app.use(await cors({credentials: true}));
  app.use(queue.getMiddleware());

  let corsOptions = {
    origin: function (origin, callback) {
      console.log('origin', origin);
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  };

  app.use(express.static(`${__dirname}`));

  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0/ws'],
      announce: [`/dns4/circuit-relay.onrender.com/tcp/443/ws`],
      // TODO check "What is next?" section
      // announce: ['/dns4/auto-relay.libp2p.io/tcp/443/wss/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3']
    },
    transports: [
      webSockets()
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    services: {
      identify: identify(),
      relay: circuitRelayServer()
    }
  })


  console.log(`Node started with id ${node.peerId.toString()}`)
  console.log('Listening on:')
  node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))


  app.get(`/env.json`, async (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'env.json'))
  })

  app.get(`/env.mjs`, async (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'env.mjs'))
  })

  app.get(`/*`, async (req, res) => {
    // console.log('index ----- index', __dirname)
    res.status(200).sendFile(path.join(__dirname, '/index.html'));
  });

  app.post(`/*`, async (req, res) => {
    console.log('==== POST ====', req.path);
  });

  app.use(queue.getErrorMiddleware());


  const port = process.env.PORT
      ? process.env.PORT
      : 4864;

  app.listen(port, () => {
    console.log('pid: ', process.pid);
    console.log('listening on http://localhost:' + port);
  });
}

main()
