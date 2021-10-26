sha1 = require('js-sha1');

var tracker;

function crearTracker() {
  let config = require("./inicialConfig.json");
  tracker = {
    ant: config.direcciones.ant,
    sig: config.direcciones.sig,
    //diccionario: new Map(),
    diccionario: [],
    id: config.id,
  };
}

function store(name, size, peers) {
  //falta almacenar el archivo en el nodo par
  let hash = sha1(name);
  let index = parseInt(hash.slice(0,2),16);
  tracker.diccionario[index] = new Map(Object.entries({
    hash: hash,
    name: name,
    size: size,
    peers: peers //objeto que contiene los pares que tienen el archivo
  }));
}

//test sha1
//console.log(sha1('ArchivoPrueba.txt'));
//console.log(sha1('1').slice(0,2));
//console.log(parseInt(sha1('ArchivoPrueba.txt').slice(0,2),16));

crearTracker();
store('ArchivoPrueba.txt',3,{ host: 'hostprueba', port: 3001 });
console.log(Object.fromEntries((tracker.diccionario[67]).entries()));


