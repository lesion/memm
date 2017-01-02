var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 8080 })

wss.on('connection', function connection (ws) {
  ws.on('message', function incoming (message) {
    console.log(message)
  })
})
