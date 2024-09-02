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
  // const relayAddr = process.argv[2]
  // if (!relayAddr) {
  //   throw new Error('the relay address needs to be specified as a parameter')
  // }

  const node = await createLibp2p({
    transports: [
      webSockets(),
      circuitRelayTransport({
        discoverRelays: 2
      })
    ],
    peerDiscovery: [
      bootstrap({
        list: [
          // '/ip4/192.168.218.166/tcp/4864/ws/p2p/12D3KooWAyrwipbQChADmVUepf7N7Q7rJcwBQw3nb4TLcrLB2uJ1',
          // '/dns4/127.0.0.1/tcp/4864/ws/p2p/12D3KooWAyrwipbQChADmVUepf7N7Q7rJcwBQw3nb4TLcrLB2uJ1',
          //   "/ip4/127.0.0.1/tcp/6572/ws/p2p/12D3KooWAyrwipbQChADmVUepf7N7Q7rJcwBQw3nb4TLcrLB2uJ1"
          "/dns4/localhost/tcp/6572/ws/p2p/12D3KooWAyrwipbQChADmVUepf7N7Q7rJcwBQw3nb4TLcrLB2uJ1"

          // "/dns4/circuit-relay.onrender.com/tcp/10000/wss/p2p/12D3KooWAyrwipbQChADmVUepf7N7Q7rJcwBQw3nb4TLcrLB2uJ1"
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

  // const conn = await node.dial(multiaddr(relayAddr))

  node.addEventListener('peer:discovery', (evt) => {
    console.log(`Connected to the relay ${evt.detail.id.toString()}`)
  })
  // console.log(`Connected to the relay ${conn.remotePeer.toString()}`)


  // Wait for connection and relay to be bind for the example purpose
  node.addEventListener('self:peer:update', (evt) => {
    // Updated self multiaddrs?
    console.log(`Advertising with a relay address of ${node.getMultiaddrs()[0].toString()}`)
  })
}

main()
