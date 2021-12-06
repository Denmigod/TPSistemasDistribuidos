const express = require("express");
const config = require("./inicialServerConfig.json");
const sha1 = require("js-sha1");
const udp = require("dgram");
var server;
var listadoArchivos = [];
var contadorMSG = 1;
var msgArrays = [];

const app = express();
const port = config.port;

const cors = require("cors");
// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

function createTrackerServer(config) {
  server = udp.createSocket("udp4");

  server.on("message", function (msg, info) {
    const remoteAddress = info.address;
    const remotePort = info.port;
    let obj = JSON.parse(msg);
    if (obj.route.indexOf("scan") != -1) {
      listadoArchivos = obj.body.files;
    }

    if (obj.route.indexOf("found") != -1) {
      //obtener el indice parseando el messageId
      let indice = obj.messageId.slice(6);
      msgArrays[indice] = {
        hash: obj.body.id,
        filename: obj.body.filename,
        trackerIP: obj.body.trackerIP,
        trackerPort: obj.body.trackerPort,
      };
    }
    // server.send(
    //   "Stored succesfull in node " + config.id,
    //   remotePort,
    //   remoteAddress
    // );
  });

  server.on("listening", function () {
    console.log("Web Server is listening udp requests.");
  });

  server.bind(config.port);
}

createTrackerServer(config);
app.get("/file/", (req, res) => {
  const msg = JSON.stringify({
    messageId: "scanId=",
    route: "/scan",
    originIP: config.host,
    originPort: config.port,
    body: {
      files: [],
    },
  });
  server.send(msg, config.direccionTracker.port, config.direccionTracker.host);

  setTimeout(() => {
    console.log("esperando datos");
    res.send(listadoArchivos);
    listadoArchivos = [];
  }, 5000);
});

app.get(`/file/:hash`, (req, res) => {
  const hash = req.params.hash;
  const indice = contadorMSG++;
  const msg = JSON.stringify({
    messageId: `search${indice}`,
    route: `/file/${hash}`,
    originIP: config.host,
    originPort: config.port,
    body: {},
  });
  //console.log(msg);
  server.send(msg, config.direccionTracker.port, config.direccionTracker.host);

  setTimeout(() => {
    console.log("esperando datos para descargar torrent");
    let respuesta = msgArrays[indice];
    if (!respuesta) respuesta = [];
    const fileContentName = `${respuesta.filename}.torrente`;
    /*
    let contenido = {
      fileContentName: `{"hash": "${hash}", "trackerIP": "${respuesta.trackerIP}", "trackerPort": "${respuesta.trackerPort}"}`,
    };*/
    let contenido = `{"hash": "${hash}", "trackerIP": "${respuesta.trackerIP}", "trackerPort": "${respuesta.trackerPort}"}`
    console.log(contenido);
    res.set({
      "Content-Disposition": `attachment; filename=${fileContentName}`,
      "Content-Type": "text/plain",
    });

    res.send(contenido);
    //res.send(contenido[fileContentName]);
  }, 5000);
});

app.post("/file", (req, res) => {
  console.log("receiving data ...");
  console.log(req.body);

  //   body: {
  //     filename: str,
  //     filesize: int,
  //     nodeIP: str,
  //     nodePort: int
  // }
  let hash = sha1(req.body.filename + req.body.filesize);
  const msg = JSON.stringify({
    route: `/file/${hash}/store`,
    body: {
      id: hash,
      filename: req.body.filename,
      filesize: req.body.filesize,
      parIP: req.body.nodeIP,
      parPort: req.body.nodePort,
    },
  });

  server.send(msg, config.direccionTracker.port, config.direccionTracker.host);
  res.status(200);
  res.send("Lo envio correctamente");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
