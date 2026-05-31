import { useEffect, useState } from "react";
import { api } from "../../../api/api";
import ExpandRow from "../ExpandRow-paciente/ExpandRow";
import "./Paciente.css";

export default function Pacientes() {

  const [pacientes, setPacientes] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const obtenerPacientes = async () => {
    try {

      const response = await api.get("/pacientes");

      setPacientes(response.data || []);

    } catch (error) {
      console.log("Error obteniendo pacientes:", error);
    }
  };

  useEffect(() => {
    obtenerPacientes();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(
      expandedId === id ? null : id
    );
  };

  return (
    <div className="patients">

      <h2>Pacientes</h2>

      <div className="patients-container">

        <div className="patients-block">

          <table className="patients-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>

              {pacientes.length === 0 ? (

                <tr>
                  <td colSpan="4">
                    Sin pacientes
                  </td>
                </tr>

              ) : (

                pacientes.map((p) => (
                  <>
                    <tr key={p.id}>

                      <td>{p.id}</td>

                      <td>{p.nombre}</td>

                      <td>{p.dni}</td>

                      <td>
                        <button
                          onClick={() => toggleExpand(p.id)}
                        >
                          {expandedId === p.id
                            ? "Cerrar"
                            : "Expandir"}
                        </button>
                      </td>

                    </tr>

                    {expandedId === p.id && (
                      <ExpandRow
                        pacienteId={p.id}
                      />
                    )}
                  </>
                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}