import React from "react";

const Formulario = ({  setFilename,setFilesize,setNodeIP,setNodePort }) => {
 

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
        className="form-input"
        placeholder="Filename"
        onChange={(e) => handleTextFilename(e.target.value)}
      ></input>
      <input
        type="text"
        className="form-input"
        placeholder="Filesize"
        onChange={(e) => handleTextFilesize(e.target.value)}
      ></input>
      <input
        type="text"
        className="form-input"
        placeholder="NodeIP"
        onChange={(e) => handleTextnodeIP(e.target.value)}
      ></input>
      <input
        type="text"
        className="form-input"
        placeholder="NodePort"
        onChange={(e) => handleNumberNodePort(e.target.value)}
      ></input>
    </form>
  );
};

export default Formulario;
