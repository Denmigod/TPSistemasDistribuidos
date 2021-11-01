import React from "react";
import Particles from "react-particles-js";
import particlesConfig from "../config/particle-config";

export default function ParticleBackground() {
  return (
    <Particles
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        margin: "0%",
      }}
      params={particlesConfig}
    />
  );
}
