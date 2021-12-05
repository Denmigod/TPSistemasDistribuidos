import ParticleBackground from "./components/ParticleBackground";
import "../src/css/normalize.css";
import "../src/css/skeleton.css";
import "../src/css/App.css";
import { Fragment, useState } from "react";

import ListadoArchivos from "./components/ListadoArchivos";

import Formulario from "./components/Formulario";
import Spineer from "./components/Spinner";
import Swal from "sweetalert2";

function App() {
  const [listado, setListado] = useState([
    { id: "kasdsa3", filename: "CSGO", filesize: "" },
    { id: "ds536a4", filename: "Wow", filesize: "" },
    { id: "hgx4532", filename: "Resident Evil 8", filesize: "" },
  ]);
  const [showBackground, setshowBackground] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [filename, setFilename] = useState("");
  const [filesize, setFilesize] = useState("");
  const [nodeIP, setNodeIP] = useState("");
  const [nodePort, setNodePort] = useState(0);

  const handleUpdate = () => {
    const callApi = async () => {
      setShowSpinner(true);
      try {
        const answer = await fetch("http://localhost:5000/file", {
          method: "GET",
        });
        const result = await answer.json();
        console.log(result);
        setShowSpinner(false);
        setListado(result);
        setFilename("");
        setFilesize("");
        setNodeIP("");
        setNodePort(0);
      } catch (error) {
        setShowSpinner(false);

        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al buscar el listado!",
        });
      }
    };
    callApi();
  };

  const handleCarga = () => {
    const callApi = async () => {
      //Comprueba si no esta vacio el formulario
      if (filename === "" || filesize === "" || nodeIP === "" || nodePort === 0)
        return Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Por favor llena los campos!",
        });

      const Data = {
        filename,
        filesize,
        nodeIP,
        nodePort,
      };

      try {
        // Muestra la alerta para esperar la respuesta
        let timerInterval;
        Swal.fire({
          title: "Cargando archivo...",

          timer: 4000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            console.log("I was closed by the timer");
          }
        });

        const answer = await fetch("http://localhost:5000/file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(Data),
        });

        //En caso de exito muestra la alerta correspondiente
        Swal.fire({
          icon: "success",
          title: "Se pudo cargar el archivo!",
          showConfirmButton: false,
          timer: 1500,
        });
        console.log(JSON.stringify(Data));
        console.log(answer);
      } catch (error) {
        //En caso contrario muestra un mensaje de error al cliente

        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al cargar el archivo!",
        });
      }
    };
    callApi();
  };
  window.onload = () => {
    setshowBackground(true);
  };
  return (
    <Fragment>
      {showBackground ? <ParticleBackground /> : null}

      <div className="container ">
        <div className="row">
          <h1 className="text-header">Cliente app</h1>
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
          <button className="button-primary" onClick={handleUpdate}>
            Actualizar Archivos
          </button>
        </div>
        {showSpinner ? <Spineer /> : null}
        {listado.length < 1 ? null : <ListadoArchivos listado={listado} />}
      </div>
    </Fragment>
  );
}

export default App;
