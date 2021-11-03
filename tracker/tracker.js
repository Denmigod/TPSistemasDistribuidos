const sha1 = require('js-sha1');
const udp = require('dgram');

var tracker;
var server;

function crearTracker() {
  let config = require("./inicialConfig.json");

  let range = setStaticRange(config); //deberían comenzar por el nodo 1

  tracker = {
    ant: config.direcciones.ant,
    sig: config.direcciones.sig,
    min_range: range.partition_begin,
    max_range: range.partition_end,
    //diccionario: new Map(),
    diccionario: [],
    id: config.id,
    server: server
  };

  createTrackerServer(config);
}

function createTrackerServer(config) {
  server = udp.createSocket('udp4');

  server.on('message', function (msg, info) {
    const remoteAddress = info.address;
    const remotePort = info.port;

    //FUNCION STORE
    /*
    let obj = JSON.parse(msg);
    let hash = obj.body.id;
    let index = parseInt(hash.slice(0, 2), 16);
    if (obj.route.indexOf('store') != -1 && ((tracker.min_range <= index) && (tracker.max_range >= index))) {
      let filename = obj.body.filename;
      let filesize = obj.body.filesize;
      let peers = { host: obj.body.parIP, port: obj.body.parPort };
      storeLocal(filename, filesize, peers);
      console.log(Object.fromEntries((tracker.diccionario[156]).entries())); //BORRAR
      //server.send('Stored succesfull in node ' + config.id, remotePort, remoteAddress);
    }*/
    let obj = JSON.parse(msg);
    if (obj.route.indexOf('store') != -1){
      store(msg);
    }

    //server.send('Stored succesfull in node ' + config.id, remotePort, remoteAddress);
  });

  server.on('listening', function () {
    console.log("Tracker " + config.id + " is listening requests.");
  });

  server.bind(config.port);
}

/*function sendData(msg, port, adress){
  server.send(msg, port, adress);
}*/

function setStaticRange(config) {
  let cantNodos = config.cantNodos;
  let partitionSize = Math.floor(256 / cantNodos);
  let partition_begin = partitionSize * (config.id - 1);
  let partition_end = partitionSize + partition_begin;
  if (cantNodos == config.id)
    partition_end += 256 % cantNodos - 1;
  let range = {
    partition_begin: partition_begin,
    partition_end: partition_end
  };
  return range;
}

function store(msg) {
  let obj = JSON.parse(msg);
  let hash = obj.body.id; //se supone que ya viene el hash en el mensaje
  let index = parseInt(hash.slice(0, 2), 16);
  if ((tracker.min_range <= index) && (tracker.max_range >= index)) {
    let filename = obj.body.filename;
    let filesize = obj.body.filesize;
    let peer = { host: obj.body.parIP, port: obj.body.parPort };
    if (tracker.diccionario[index] == null) { //el dominio con ese indice se encuentra sin utilizar
        tracker.diccionario[index] = [{
          hash: hash,
          filename: filename,
          filesize: filesize,
          peers: [peer] //objeto que contiene los pares que tienen el archivo
          }
        ]  //VECTOR
    }
    else {
      let arrayoffiles = tracker.diccionario[index];
      let indexedfile = arrayoffiles.filter(function (fileinfo) { //filtra si existe un archivo con el mismo hash
        return fileinfo.hash == hash;
      });
      if(indexedfile.length>0){  //ya existe un archivo con el hash correspondiente
        indexedfile[0].peers.push(peer);
      } else {  //no existe un archivo con el hash correspondiente
        arrayoffiles.push({
          hash: hash,
          filename: filename,
          filesize: filesize,
          peers: [peer] //objeto que contiene los pares que tienen el archivo
          }
        );
      }
    }
    //BORRAR
    //console.log(Object.fromEntries((tracker.diccionario[254]).entries()));
    //console.log(tracker.diccionario[254][0]);
    //console.log(tracker.diccionario[254][1]);
  }
  else if ((tracker.sig.port != null) && (tracker.sig.host != null)) {
    server.send(msg, tracker.sig.port, tracker.sig.host);
  }
}

function sendStore(filename, filesize, peerIP, peerPort) {
  msg = {
    route: "/file/{hash}/store(TEST)",
    //originIP: str,???
    //originPort: int,???
    body: {
      id: sha1(filename + filesize),
      filename: filename,
      filesize: filesize,
      parIP: peerIP,
      parPort: peerPort
    }
  }
  server.send(JSON.stringify(msg), tracker.sig.port, tracker.sig.host);
}

//test sha1
//console.log(sha1('ArchivoPrueba.txt'));
//console.log(sha1('1').slice(0,2));
//console.log(parseInt(sha1('ArchivoPrueba.txt').slice(0,2),16));

crearTracker();
storeLocal('ArchivoPrueba.txt', 3, { host: 'hostprueba', port: 3001 });
//storeLocal('ArchivoPrueba.txt',3,{ host: 'hostpruebados', port: 3002 });
//store('ArchivoPrueba.txt',3,[{ host: 'hostpruebados', port: 3002 }, { host: 'hostpruebatres', port: 3003 }]);
//preguntar si es posible dar de alta dos pares para un archivo al mismo tiempo => por ahora suponemos que no
//console.log(Object.fromEntries((tracker.diccionario[67]).entries()));
console.log(Object.fromEntries((tracker.diccionario[156]).entries()));
//console.log(tracker.min_range + ' ' + tracker.max_range);