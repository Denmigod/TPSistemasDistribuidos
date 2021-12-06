const net = require("net");
const udp = require("dgram");
const fs = require("fs");
const sha1 = require("js-sha1");
var readline = require("readline");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
    //trackerHost: config.trackerHost,
    //trackerPort: config.trackerPort
  };
  createPeerServer(config);
  createPeerClient(config);
}

function createPeerServer(config) {
  server = net.createServer(incomingConnection);
  function incomingConnection(socket) {
    socket.on("data", function (data) {
      let obj = JSON.parse(data);
      if (obj.type == "GET FILE") {
        //let torrentHash = data.toString();
        let file = par.files.get(obj.hash);
        if (file) {
          fs.readFile(file.filename, (err, data) => {
            if (!err) {
              socket.write(data);
            } else {
              console.log(`readfile ${file.filename} err.`);
            }
          });
        }
      }
    });
  }
  server.on("error", (err) => {
    throw err;
  });
  server.listen(config.port, config.host, () => {
    console.log(
      `Peer ${config.id} is listening requests bound to port ${config.port}.`
    );
  });
}

function createPeerClient(config) {
  client = udp.createSocket("udp4");

  client.on("message", function (msg, info) {
    const remoteAddress = info.address;
    const remotePort = info.port;
    let obj = JSON.parse(msg);
    if (obj.route.indexOf("found") != -1) {
      //count(msg);
      //console.log(obj.body.pares);
      let torrent = {
        hash: obj.body.id,
        filename: obj.body.filename,
        port: obj.body.pares[0].parPort,
        address: obj.body.pares[0].parIP,
      };
      console.log(torrent);
      //downloadFile(torrent);
    }
  });

  client.on("listening", function () {
    console.log(
      `Peer ${config.id} is listening udp requests on port ${config.clientPort}.`
    );
  });

  client.bind(config.clientPort);
}

function loadJSON(file) {
  let data = fs.readFileSync(file);
  return JSON.parse(data);
}

const requestTorrentDownload = () => {
  return new Promise((resolve, reject) => {
    let torrent;
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      "Escriba el nombre del torrent que desea utilizar",
      function (name) {
        torrent = loadJSON(`./${name}`);
        rl.close();
      }
    );
    rl.on("close", function () {
      requestTorrentInformation(torrent);
    });
  });
};

function requestTorrentInformation(torrent) {
  let hash = torrent.hash;
  let msg = {
    messageId: `searchPeer${par.id}`,
    route: `/file/${hash}`,
    originIP: par.host,
    originPort: par.clientPort,
    body: {},
  };
  //console.log(par.clientPort);
  client.send(JSON.stringify(msg), torrent.trackerPort, torrent.trackerIP);
}

function downloadFile(torrent) {
  const client = net.connect(
    { port: torrent.port, address: torrent.host },
    () => {
      // 'connect' listener
      console.log("connected to server!");
      //console.log(torrent.hash);
      client.write(
        JSON.stringify({
          type: "GET FILE",
          hash: torrent.hash,
        })
      );
    }
  );
  const chunks = [];
  client.on("data", (chunk) => {
    chunks.push(chunk);
    //console.log(chunks.length);
    //console.log(chunk);
    client.end();
  });
  client.on("end", () => {
    const file = Buffer.concat(chunks);
    fs.writeFile(torrent.filename, file, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
    console.log("disconnected from server");
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
  };
  client.send(JSON.stringify(msg), par.trackerPort, par.trackerHost);
}

function addFile(filename, filesize) {
  let hash = sha1(filename + filesize);
  let file = {
    filename: filename,
    filesize: filesize,
  };
  par.files.set(hash, file);
  //console.log(hash);
}

createPeer();
//requestTorrentDownload();
addFile("daemon0.jpg", 213056);
//addFile('archivoprueba2.txt',2);
//console.log(par.files);
//console.log(par.files.get('15be7e8342476cb6661f16e7f5378b0bc0b20f20'));

//requestTorrentInformation('da igual hay que modificar la funcion', 3);

const addNewFile = async () => {
  return new Promise((resolve, reject) => {
    rl.question(
      "Escriba el nombre del archivo y el filezise separado por una coma (ejemplo: daemon.jpg,213056): ",
      (r) => {
        const filenameNewArray = r.split(",");
        addFile(filenameNewArray[0], Number(filenameNewArray[1]));
        rl.close();
        resolve("Agregado!");
      }
    );
  });
};

const menuText = async () => {
  return new Promise((resolve, reject) => {
    rl.question("1_Descargar Torrent 2_Agregar Archivo ", (r) => {
      var aux;
      if (r == 1) {
        rl.close();
        requestTorrentDownload().then((resultado) => {
          console.log(resultado);
        });
      } else {
        rl.close();
        addNewFile().then((resultado) => {
          console.log(resultado);
        });
      }
      resolve("Gracias!");
    });
  });
};

async function showMenu() {
  while (true) {
    console.log(
      "-------------------------------------------------------------"
    );

    let aux = await menuText();

    console.log(
      "-------------------------------------------------------------"
    );
  }
}

showMenu();
