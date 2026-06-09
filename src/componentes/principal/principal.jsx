import { useState } from "react"
import Login from "../Personal/Login/Login"
import ChatBot from "../Paciente/ChatBot/ChatBot"
import "./principal.css"

export default function Principal() {

  const [vista, setVista] = useState(false)

  if (vista === "trabajador") {
    return <Login />;
  }

  if (vista === "paciente") {
    return <ChatBot />;
  }

  return (
    <div className="principal-container">

      <div className="principal-lado principal-blanco">
        <button 
          className="principal-btn principal-paciente"
          onClick={() => setVista("paciente")}>

          Soy Paciente
        </button>
      </div>

      <div className="principal-lado principal-celeste">
        <button
          className="principal-btn principal-trabajador"
          onClick={() => setVista("trabajador")}
        >
          Soy Trabajador
        </button>
      </div>

    </div>
  )
}