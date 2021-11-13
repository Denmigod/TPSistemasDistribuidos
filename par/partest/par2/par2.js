const net = require('net');
const fs = require('fs');
const sha1 = require('js-sha1');

var par;
var server;

function createPeer() {
    let config = require("./inicialConfig.json");
    par = {
        id: config.id,
        host: config.host,
        port: config.port,
        server: server,
        files: new Map()
    };
    createPeerServer(config);
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

function requestTorrentInformation(){

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
    console.log(hash);
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