var protocol = require('./protocol.js')
var net = require('net')

var server = net.createServer(protocol.create(function (peer) {

}));

server.listen(9002)
