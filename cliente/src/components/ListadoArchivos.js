import React, { Fragment } from "react";
import Card from "./Card";

const ListadoArchivos = ({ listado }) => {
 
  return (
    <Fragment>
      {listado?.map((element) => (
        <Card key={element.id} filename={element.filename} id={element.id} />
      ))}
    </Fragment>
  );
};

export default ListadoArchivos;
