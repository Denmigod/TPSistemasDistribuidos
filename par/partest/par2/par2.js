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
            let obj = JSON.parse(data);
            if (obj.type == 'GET FILE') {
                //let torrentHash = data.toString();
                let file = par.files.get(obj.hash);
                if (file) {
                    fs.readFile(file.filename, (err, data) => {
                        if (!err) {
                            socket.write(data);
                        }
                        else {
                            console.log(`readfile ${file.filename} err.`);
                        }
                    });
                }
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
        if (obj.route.indexOf('found') != -1) {
            let torrent = { 
                hash: obj.body.id,
                filename: obj.body.filename,
                port: obj.body.pares[0].parPort, 
                address: obj.body.pares[0].parIP
            }
            downloadFile(torrent);
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
        requestTorrentInformation(torrent);
    });
}

function requestTorrentInformation(torrent) {
    let hash = torrent.hash;
    let msg = {
        messageId: `searchPeer${par.id}`,
        route: `/file/${hash}`,
        originIP: par.host,
        originPort: par.clientPort,
        body: {}
    }
    //console.log(par.clientPort);
    client.send(JSON.stringify(msg), torrent.trackerPort, torrent.trackerIP);
}

function downloadFile(torrent) {
    const client = net.connect({ port: torrent.port, address: torrent.host }, () => {
        // 'connect' listener
        console.log('connected to server!');
        //console.log(torrent.hash);
        client.write(JSON.stringify({
            type: 'GET FILE',
            hash: torrent.hash
        }));
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
        fs.writeFile(torrent.filename, file, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        console.log('disconnected from server');
    });
}

function addFile(filename, filesize) {
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
requestTorrentDownload();

/*
const client = net.connect({ port: 3000, address: 'localhost' }, () => {
    // 'connect' listener
    console.log('connected to server!');
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
*/
//REQUESTING A FILE AND GETTING IT BY CHUNKS

//https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
//https://stackoverflow.com/questions/2496710/writing-files-in-node-js
//https://stackoverflow.com/questions/36397950/how-to-send-file-over-tcp-in-one-time-in-nodejs