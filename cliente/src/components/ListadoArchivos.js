import React, { Fragment } from "react";

const ListadoArchivos = ({ listado }) => {
  return (
    <Fragment>
      {listado?.map((element) => (
        <div className="row">
          <div className="three columns nom-arch">{element.nombre}</div>
          
            <button className="button-primary">Descargar Torrent</button>
          
        </div>
      ))}
    </Fragment>
  );
};

export default ListadoArchivos;
