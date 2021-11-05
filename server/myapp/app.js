const express = require("express");
const config = require("./inicialServerConfig.json");
const sha1 = require('js-sha1');
const udp = require('dgram');
var server;

const app = express();
const port = config.port;

const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);


function createTrackerServer(config) {
  server = udp.createSocket('udp4');

  server.on('message', function (msg, info) {
    const remoteAddress = info.address;
    const remotePort = info.port;
    if (obj.route.indexOf('scan') != -1){
      //scan(msg);
    }
    server.send('Stored succesfull in node ' + config.id, remotePort, remoteAddress);
  });

  server.on('listening', function () {
    console.log("Tracker " + config.id + " is listening requests.");
  });

  server.bind(config.port);
}

app.get("/file/", (req, res) => {
  
  const callTracker= async ()=>{

    const msg= JSON.stringify({
      messageId: "scanId=",
      route: "/scan",
      originIP: config.host,
      originPort: config.port,
      body: {
        files: [],
      },
    })
    
    await    server.send(msg,config.direccionTracker.port,config.direccionTracker.host);
    res.send( );
  }
  callTracker();
});

app.get(`/file/:hash`, (req, res) => {
  const hash = req.params.hash;

  res.send([{ id: "15", filename: "CSGO", filesize: 500 }]);
});

app.post("/file", (req, res) => {
  console.log("receiving data ...");
  console.log("body is ", req.body);
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
