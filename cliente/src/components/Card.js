import React from "react";
import Swal from "sweetalert2";


const Card = ({ id, filename }) => {
  const handleDownload = () => {
    const callApi = async () => {
      try {
        const answer = await fetch(`http://localhost:5000/file/${id}`, {
          method: "GET",
        });
        const result = await answer.json();
        console.log(result);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Error al tratar de descargar el torrent de ${filename} !`,
        });
      }
    };
    callApi();
  };

  return (
    <div className="row">
      <div className="four columns nom-arch">{filename}</div>

      <button className="button-primary" onClick={handleDownload}>
        Descargar Torrent
      </button>
    </div>
  );
};

export default Card;
