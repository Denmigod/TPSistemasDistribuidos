import React from "react";

const Error = ({ error }) => {
  const { msg } = error;
  return (
    <div className="row">
      <p className="error">{msg}</p>
    </div>
  );
};

export default Error;
