import "../src/css/normalize.css";
import "../src/css/skeleton.css";
import "../src/css/App.css";
import { Fragment, useState } from "react";
import ParticleBackground from "./components/ParticleBackground";
import ListadoArchivos from "./components/ListadoArchivos";
import Footer from "./components/Footer";

function App() {
  const [listado, setListado] = useState([
    { nombre: "CSGO" },
    { nombre: "Wow" },
    { nombre: "Resident Evil 8" },
  ]);

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

  const handleLoad = () => {
    const callApi = async () => {
      const Data = [{ id: "10", filename: "RESIDENT", filesize: 600 }];
      try {
        const answer = await fetch("http://localhost:5000/file", {
          method: "POST",
          body: JSON.parse(Data),
        });
        const result = await answer.json();
        console.log(result);
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
          <button className="button-primary" onClick={handleLoad}>
            Cargar Archivo
          </button>
        </div>
        <div className="container list-c">
          <ListadoArchivos listado={listado} />
        </div>
      </div>
    </Fragment>
  );
}

export default App;
