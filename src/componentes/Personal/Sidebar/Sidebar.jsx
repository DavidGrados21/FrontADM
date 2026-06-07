import "./Sidebar.css"
import { useState } from "react"

export default function Sidebar({ setView , idDoctor }){
  const [open, setOpen] = useState(false)

  return (
    <div className="sidebar-container">
      {/* Botón hamburguesa */}
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <img
          src="/Logo.jpeg"
          alt="Logo"
          className="sidebar-logo"
        />

        <nav>
          <button
            className="sidebar-btn"
            onClick={() => {
              setView("patients")
              setOpen(false)
            }}
          >
            Principal
          </button>
          {idDoctor === 0 && (
            <>
              <button
                className="sidebar-btn"
                onClick={() => {
                  setView("dashboard");
                  setOpen(false);
                }}
              >
                Dashboard
              </button>
                      
              <button
                className="sidebar-btn"
                onClick={() => {
                  setView("dashboard");
                  setOpen(false);
                }}
              >
                Pacientes
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}