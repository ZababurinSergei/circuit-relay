/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'

async function main () {
  // const autoRelayNodeAddr = process.argv[2]
  // if (!autoRelayNodeAddr) {
  //   throw new Error('the auto relay node address needs to be specified')
  // }

  const node = await createLibp2p({
    transports: [
      webSockets(),
      circuitRelayTransport()
    ],
    peerDiscovery: [
      bootstrap({
        list: [
          '/ip4/192.168.186.36/tcp/32779/ws/p2p/12D3KooWJTvUdtVdJZeaWo89tPd9hcWFojD34n9WECdCdcNgAzG6',
        ]
      })
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    services: {
      identify: identify()
    }
  })

  console.log(`Node started with id ${node.peerId.toString()}`)

  node.addEventListener('peer:discovery', (evt) => {
    // console.log(`Connected to the relay ${evt.detail.id.toString()}`)
    console.log(`Connected to the auto relay node via ${evt.detail.id.toString()}`)
  })

  // const conn = await node.dial(multiaddr(autoRelayNodeAddr))
  // console.log(`Connected to the auto relay node via ${conn.remoteAddr.toString()}`)
}

main()
