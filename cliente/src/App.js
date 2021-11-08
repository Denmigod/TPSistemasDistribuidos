import "../src/css/normalize.css";
import "../src/css/skeleton.css";
import "../src/css/App.css";
import { Fragment, useState, useEffect } from "react";
import ParticleBackground from "./components/ParticleBackground";
import Error from "./components/Error";
import ListadoArchivos from "./components/ListadoArchivos";
import Footer from "./components/Footer";
import Formulario from "./components/Formulario";

function App() {
  const [listado, setListado] = useState([
    { id: "", filename: "CSGO", filesize: "" },
    { id: "", filename: "Wow", filesize: "" },
    { id: "", filename: "Resident Evil 8", filesize: "" },
  ]);

  const [error, setError] = useState({
    estado: false,
    msg: "",
  });
  const [cargaArchivo, setCargaArchivo] = useState({
    filename: "",
    filesize: "",
    nodeIP: "",
    nodePort: 0,
  });

  const handleUpdate = () => {
    const callApi = async () => {
      const answer = await fetch("http://localhost:5000/file", {
        method: "GET",
      });
      const result = await answer.json();
      console.log(result);
    };
    callApi();
  };

  useEffect(() => {
    const callApi = async () => {
      const Data = {
        filename: cargaArchivo.filename,
        filesize: cargaArchivo.filesize,
        nodeIP: cargaArchivo.nodeIP,
        nodePort: cargaArchivo.nodePort,
      };

      try {
        const answer = await fetch("http://localhost:5000/file", {
          method: "POST",
          body: JSON.parse(Data),
        });

        console.log(answer);
      } catch (error) {
        console.log(error);
      }
    };
    callApi();
  }, [cargaArchivo]);

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
          <Formulario setCargaArchivo={setCargaArchivo} error={error} />
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
