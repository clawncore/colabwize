import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

// Simple mock WebSocket that just logs what messages it sends
class MockWebSocket {
  constructor(url) {
    this.url = url
    setTimeout(() => {
      this.onopen({ type: 'open' })
    }, 100)
  }
  send(data) {
    console.log('Sending message:', Array.from(data))
  }
  close() {}
}

global.WebSocket = MockWebSocket

const doc = new Y.Doc()
const provider = new HocuspocusProvider({
  url: 'ws://localhost',
  name: 'test-doc',
  document: doc,
  token: 'mock-token-xyz',
})

// Wait for a second and then check logs
setTimeout(() => {
  console.log('Done test.')
  process.exit(0)
}, 1000)
