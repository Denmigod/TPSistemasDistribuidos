const net = require('net');
const fs = require('fs');

var server;

function createPeer() {
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
    function incomingConnection(socket) {
        socket.on('data', function (data) {
            let torrentName = data.toString();
            fs.readFile(torrentName, (err, data) => {
                if (!err) {
                    //console.log(data.length);
                    socket.write(data);
                }
                else {
                    console.log(`readfile ${torrentName} err.`);
                }
            });
        });
    }
    server.on('error', (err) => {
        throw err;
    });
    server.listen(config.port, config.host, () => {
        console.log(`Peer ${config.id} is listening requests bound to port ${config.port}.`);
    });
}

createPeer();
requestTorrentDownload();

function loadJSON(file) {
    let data = fs.readFileSync(file);
    return JSON.parse(data);
}

function requestTorrentDownload() {
    let file, torrent;
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Escriba el nombre del torrent que desea utilizar', function (name) {
        //file = require(`./${name}`);
        torrent = loadJSON(`./${name}`);
        rl.close();
        //console.log(torrent);
    });
    rl.on("close", function () {
        //process.exit(0);
        //console.log(torrent);
        downloadFile(torrent);
    });
}

function downloadFile(torrent) {
    const client = net.connect({ port: torrent.port, address: torrent.host }, () => {
        // 'connect' listener
        console.log('connected to server!');
        console.log(torrent.name);
        client.write(torrent.name);
    });
    const chunks = [];
    client.on('data', chunk => {
        chunks.push(chunk);
        //console.log(chunks.length);
        //console.log(chunk);
        client.end();
    });
    client.on('end', () => {
        const file = Buffer.concat(chunks);

        fs.writeFile('message.jpg', file, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        console.log('disconnected from server');
    });
}

createPeer();
