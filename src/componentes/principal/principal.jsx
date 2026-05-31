import { useState } from "react"
import VistaPersonal from "../Personal/VistaPersonal/VistaPersonal"
import "./principal.css"

export default function Principal() {

  const [enter, setEnter] = useState(false)

  if (enter) {
    return <VistaPersonal />
  }

  return (
    <div className="principal-container">

      <div className="principal-lado principal-blanco">
        <button className="principal-btn principal-paciente">
          Soy Paciente
        </button>
      </div>

      <div className="principal-lado principal-celeste">
        <button
          className="principal-btn principal-trabajador"
          onClick={() => setEnter(true)}
        >
          Soy Trabajador
        </button>
      </div>

    </div>
  )
}