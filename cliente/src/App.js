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
  return (
    <Fragment>
      <ParticleBackground />
      <div className="container ">
        <div className="row">
          <h1 className="text-header">Cliente app</h1>
        </div>
        <div className="row">
          <button className="button-primary">Actualizar Archivos</button>
          <button className="button-primary">Cargar Archivo</button>
        </div>
        <div className="container list-c">
          <ListadoArchivos listado={listado} />
        </div>
      </div>
    
    </Fragment>
  );
}

export default App;
