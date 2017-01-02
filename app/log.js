/* global WebSocket */
// var ws = new WebSocket('ws://localhost:8080')

export default function log (message) {
  console.error(message)
  // if (typeof message === 'object') {
  //   message = JSON.stringify(message)
  // }

  // ws.send(message)
}
