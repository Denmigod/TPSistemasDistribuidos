import React, { useState } from "react";

const Formulario = ({ setCargaArchivo, setError }) => {
  const [filename, setFilename] = useState("");
  const [filesize, setFilesize] = useState("");
  const [nodeIP, setNodeIP] = useState("");
  const [nodePort, setNodePort] = useState(0);

  const handleCarga = () => {
    if (filename === "" || !(filesize === "") || !(nodeIP === "") || !nodePort)
      setError({ estado: true, msg: "Llene correctamente los campos" });
    const cargaArchivo = {
      filename,
      filesize,
      nodeIP,
      nodePort,
    };
    setCargaArchivo(cargaArchivo);
  };

  const handleTextFilename = (value) => {
    setFilename(value);
  };

  const handleTextFilesize = (value) => {
    setFilesize(value);
  };

  const handleTextnodeIP = (value) => {
    setNodeIP(value);
  };

  const handleNumberNodePort = (value) => {
    setNodePort(value);
  };

  return (
    <form>
      <input
        type="text"
        class="form-input"
        placeholder="Filename"
        onChange={(e) => handleTextFilename(e.target.value)}
      ></input>
      <input
        type="text"
        class="form-input"
        placeholder="Filesize"
        onChange={(e) => handleTextFilesize(e.target.value)}
      ></input>
      <input
        type="text"
        class="form-input"
        placeholder="NodeIP"
        onChange={(e) => handleTextnodeIP(e.target.value)}
      ></input>
      <input
        type="number"
        class="form-input"
        placeholder="NodePort"
        onChange={(e) => handleNumberNodePort(e.target.value)}
      ></input>
      <button className="button-primary" onClick={handleCarga}>
        Cargar Archivo
      </button>
    </form>
  );
};

export default Formulario;
