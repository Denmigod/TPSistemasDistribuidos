import React from 'react';

const Card = ({id,filename}) => {

    const handleDownload= ()=>{
        const callApi = async () => {
          const answer = await fetch(`http://localhost:5000/file/${id}`, {
            method: "GET",
          });
          const result = await answer.json();
          console.log(result);
        };
        callApi();
      }

    return ( <div  className="row">
    <div className="three columns nom-arch">{filename}</div>

    <button className="button-primary" onClick={handleDownload} >Descargar Torrent</button>
  </div> );
}
 
export default Card;