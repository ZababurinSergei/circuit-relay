/* eslint-disable no-console */
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'

async function create ({ peerId, listenAddresses = [], announceAddresses = [], pubsubDiscoveryEnabled = true, pubsubDiscoveryTopics = ['_peer-discovery._p2p._pubsub'] }) {

 const libp2p = await createLibp2p({
    transports: [
      tcp(),
      webSockets()
    ],
    streamMuxers: [
      yamux()
    ],
    connectionEncryption: [
      noise()
    ],
    addresses: {
      listen: listenAddresses,
      announce: announceAddresses
    },
    services: {
      identify: identify(),
      relay: circuitRelayServer()
    }
  })


  console.log(`Node started with id ${node.peerId.toString()}`)
  console.log('Listening on:')
  libp2p.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString())
  })

  return libp2p
}

export default  create
