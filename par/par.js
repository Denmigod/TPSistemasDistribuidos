const net = require('net');
const udp = require('dgram');
const fs = require('fs');
const sha1 = require('js-sha1');

var par;
var client;
var server;

function createPeer() {
    let config = require("./inicialConfig.json");
    par = {
        id: config.id,
        host: config.host,
        port: config.port,
        server: server,
        files: new Map(),
        client: client,
        clientPort: config.clientPort,
        trackerHost: config.trackerHost,
        trackerPort: config.trackerPort
    };
    createPeerServer(config);
    createPeerClient(config);
}

function createPeerServer(config) {
    server = net.createServer(incomingConnection);
    function incomingConnection(socket) {
        socket.on('data', function (data) {
            let torrentHash = data.toString();
            let file = par.files.get(torrentHash);
            if(file) {
                fs.readFile(file.filename, (err, data) => {
                    if (!err) {
                        //console.log(data.length);
                        socket.write(data);
                    }
                    else {
                        console.log(`readfile ${file.filename} err.`);
                    }
                });
            }
        });
    }
    server.on('error', (err) => {
        throw err;
    });
    server.listen(config.port, config.host, () => {
        console.log(`Peer ${config.id} is listening requests bound to port ${config.port}.`);
    });
}

function createPeerClient(config) {
    client = udp.createSocket('udp4');
  
    client.on('message', function (msg, info) {
      const remoteAddress = info.address;
      const remotePort = info.port;
      let obj = JSON.parse(msg);
      if (obj.route.indexOf('found') != -1){
        //count(msg);
        console.log(obj);
      }
    });
  
    client.on('listening', function () {
      console.log(`Peer ${config.id} is listening udp requests on port ${config.clientPort}.`);
    });
  
    client.bind(config.clientPort);
}

function loadJSON(file) {
    let data = fs.readFileSync(file);
    return JSON.parse(data);
}

function requestTorrentDownload() {
    let torrent;
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Escriba el nombre del torrent que desea utilizar', function (name) {
        torrent = loadJSON(`./${name}`);
        rl.close();
    });
    rl.on("close", function () {
        downloadFile(torrent);
    });
}

function requestTorrentInformation(filename, filesize){
    let hash = sha1(filename + filesize);
    let msg = {
        messageId: 'search00001',
        route: '/file/fe9635d7a6ae44389f6480e13fee5b0127ed86be',
        originIP: par.host,
        originPort: par.clientPort,
        body: {}
    }
    console.log(par.clientPort);
    client.send(JSON.stringify(msg), par.trackerPort, par.trackerHost);
}

function downloadFile(torrent) {
    const client = net.connect({ port: torrent.port, address: torrent.host }, () => {
        // 'connect' listener
        console.log('connected to server!');
        console.log(torrent.hash);
        client.write(torrent.hash);
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

function addFile(filename, filesize){
    let hash = sha1(filename + filesize);
    let file = {
        filename: filename,
        filesize: filesize
    }
    par.files.set(hash, file);
    //console.log(hash);
}

createPeer();
//requestTorrentDownload();
addFile('daemon0.jpg',213056);
//addFile('archivoprueba2.txt',2);
//console.log(par.files);
//console.log(par.files.get('15be7e8342476cb6661f16e7f5378b0bc0b20f20'));
requestTorrentInformation('da igual hay que modificar la funcion', 3);