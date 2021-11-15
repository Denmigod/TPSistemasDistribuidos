import React from "react";
import Card from "./Card";
import   "../css/App.css";
const ListadoArchivos = ({ listado }) => {
 
  return (
    <div className="container list-c">

      {listado?.map((element) => (
        <Card key={element.id} filename={element.filename} id={element.id} />
      ))}
    </div>
   
  );
};

export default ListadoArchivos;
