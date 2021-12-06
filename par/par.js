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

/*
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
*/

function openTrackerTerminal() {
    let torrent;
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    console.clear();
    console.log(`MENU - PAR ${par.id}\n 
                (1) Descargar un torrente.\n 
                (2) Agregar un archivo a este par.\n
                (3) Guardar un archivo existente para este par en los trackers.\n
                (exit) Cerrar el par`);
    rl.on("line", (input) => {
        switch (input) {
            case "1":
                rl.question('Escriba el nombre del torrent que desea utilizar:\n', function (name) {
                    torrent = loadJSON(`./${name}`);
                    requestTorrentInformation(torrent);
                });
                break;
            case "2":
                rl.question('Escriba el nombre y el tamaño del archivo separado por ":" para agregarlo a la lista de archivos del par:\n', (text) => {
                    const arrayText = text.split(":");
                    const filename = arrayText[0]
                    const filesize = Number(arrayText[1])
                    addFile(filename, filesize);
                });
                break;
            case "3":
                rl.question('Escriba el nombre y el tamaño del archivo separado por ":" que desea a los trackers:\n', (text) => {
                    const arrayText = text.split(":");
                    const filename = arrayText[0]
                    const filesize = Number(arrayText[1])
                    addExistingFile(filename, filesize);
                });
                break;
            case "exit":
                rl.close();
                server.close();
                client.close();
                break;
        }
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
    client.send(JSON.stringify(msg), torrent.trackerPort, torrent.trackerIP);
}

function downloadFile(torrent) {
    const client = net.connect({ port: torrent.port, address: torrent.host }, () => {
        // 'connect' listener
        console.log('connected to server!');
        client.write(JSON.stringify({
            type: 'GET FILE',
            hash: torrent.hash
        }));
    });
    const chunks = [];
    client.on('data', chunk => {
        chunks.push(chunk);
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

function addExistingFile(filename, filesize) {
    let hash = sha1(filename + filesize);
    let msg = {
        messageId: `addParId=${par.id}`,
        route: `/file/${hash}/addPar`,
        id: hash,
        filename: filename,
        filesize: filesize,
        parIP: par.host,
        parPort: par.port,
    }
    client.send(JSON.stringify(msg), par.trackerPort, par.trackerHost);
}

function addFile(filename, filesize) {
    let hash = sha1(filename + filesize);
    let file = {
        filename: filename,
        filesize: filesize
    }
    par.files.set(hash, file);
}

createPeer();
//addFile('daemon0.jpg', 213056);
openTrackerTerminal();