import ParticleBackground from "./components/ParticleBackground";
import "../src/css/normalize.css";
import "../src/css/skeleton.css";
import "../src/css/App.css";
import { Fragment, useState, useEffect } from "react";
import Error from "./components/Error";
import ListadoArchivos from "./components/ListadoArchivos";
import Footer from "./components/Footer";
import Formulario from "./components/Formulario";

function App() {
  const [listado, setListado] = useState([
    // { id: "", filename: "CSGO", filesize: "" },
    // { id: "", filename: "Wow", filesize: "" },
    // { id: "", filename: "Resident Evil 8", filesize: "" },
  ]);

  const [filename, setFilename] = useState("");
  const [filesize, setFilesize] = useState("");
  const [nodeIP, setNodeIP] = useState("");
  const [nodePort, setNodePort] = useState(0);

  const [error, setError] = useState({
    estado: false,
    msg: "",
  });

  const handleUpdate = () => {
    const callApi = async () => {
      const answer = await fetch("http://localhost:5000/file", {
        method: "GET",
      });
      const result = await answer.json();
      console.log(result);
      setListado(result);
      setFilename("");
      setFilesize("");
      setNodeIP("");
      setNodePort(0);
    };
    callApi();
  };

  const handleCarga = () => {
    // if (filename === "" || !(filesize === "") || !(nodeIP === "") || !nodePort)
    //   setError({ estado: true, msg: "Llene correctamente los campos" });
    // else {
    //   const cargaArchivo = {
    //     filename,
    //     filesize,
    //     nodeIP,
    //     nodePort,
    //   };
    //   setCargaArchivo(cargaArchivo);
    // }
    const callApi = async () => {
      if (filename === "" || filesize === "" || nodeIP === "" || nodePort === 0)
        return;
      const Data = {
        filename,
        filesize,
        nodeIP,
        nodePort,
      };

      try {
        const answer = await fetch("http://localhost:5000/file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(Data),
        });
        console.log(JSON.stringify(Data));
        console.log(answer);
      } catch (error) {
        console.log(error);
      }
    };
    callApi();
  };

  return (
    <Fragment>
      <ParticleBackground />
      <div className="container ">
        <div className="row">
          <h1 className="text-header">Cliente app</h1>
        </div>
        <div className="row">
          <button className="button-primary" onClick={handleUpdate}>
            Actualizar Archivos
          </button>
        </div>
        <div className="row">
          <Formulario
            setFilename={setFilename}
            setFilesize={setFilesize}
            setNodeIP={setNodeIP}
            setNodePort={setNodePort}
          />
          <button className="button-primary" onClick={handleCarga}>
            Cargar Archivo
          </button>
        </div>
        {error.estado ? <Error error={error} /> : null}
        <div className="container list-c">
          <ListadoArchivos listado={listado} setError={setError} />
        </div>
      </div>
    </Fragment>
  );
}

export default App;
