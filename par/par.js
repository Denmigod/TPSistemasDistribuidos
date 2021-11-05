const net = require('net');

var server;

function createPeer(){
    let config = require("./inicialConfig.json");
    tracker = {
        //diccionario: [],
        id: config.id,
        host: config.host,
        port: config.port,
        server: server
    };
    createPeerServer(config);
}

function createPeerServer(config) {
    server = net.createServer(incomingConnection);

    server.listen(config.port, function() {
        console.log(`Peer ${config.id} is listening requests.`);
    });

    function incomingConnection(socket) {
        console.log('Socket connected');

        socket.on('data', function(data) {
            socket.write();
        });

        socket.on('close', function(msg) {
            //server.close(); //no vamos a cerrar el par al cortar la conexión
        });
    }
}

