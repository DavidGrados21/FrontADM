import { useEffect, useState } from "react";
import TriajeModal from "../TriajeModal/TriajeModal";
import { api } from "../../../api/api";
import "./ColaPacientes.css";

export default function ColaPacientes() {
  const [entrantes, setEntrantes] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [enAtencion, setEnAtencion] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);

  const abrirModal = (caso) => {
    setCasoSeleccionado(caso);
    setModalOpen(true);
  };

  const cambiarAAtencion = async (caso_id) => {
    try {
      const resPend = await api.put(`/pasar-a-atencion/${caso_id}`);
      console.log(resPend.data);
    } catch (error) {
      console.error(error);
    }
    obtenerDatos();
  };

  const obtenerDatos = async () => {
    try {
      const resPend = await api.get("/cola/entrante");
      setEntrantes(resPend.data.casos || []);
    } catch (error) {console.error("Error entrantes:", error);}

    try {
      const resAtn = await api.get("/cola/pendiente");
      setPendientes(resAtn.data.casos || []);
    } catch (error) {console.error("Error pendientes:", error);}

    try {
      const resFin = await api.get("/cola/en_atencion");
      setEnAtencion(resFin.data.casos || []);
    } catch (error) {console.error("Error en atención:", error);}
  };

  useEffect(() => {
    obtenerDatos();

    const interval = setInterval(obtenerDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderTabla = (data , tipo) => {
    if (!data || data.length === 0) {
      return (
        <tr>
          <td colSpan="4">Sin pacientes</td>
        </tr>
      );
    }

    return data.map((p) => (
      <tr key={p.caso_id}>
        <td data-label="ID">{p.caso_id}</td>
        <td data-label="DNI">{p.dni}</td>
        <td className="name-cell" data-label="Nombre">{p.nombre}</td>
        {tipo === "pendiente" && <td className="priority-cell">{p.prioridad}</td>}
        {tipo === "enAtencion" && <td className="priority-cell">{p.prioridad}</td>}
        <td>
          {tipo === "entrante" && (
            <button onClick={() => abrirModal(p)}>
              Hacer triaje
            </button>
          )}
          {tipo === "pendiente" && (
            <button onClick={() => cambiarAAtencion(p.caso_id)}>
              Atender
            </button>
          )}
          {tipo === "pendiente" && (
            <button onClick={() => Descrip(p.caso_id)}>
              Descripcion
            </button>
          )}
          
        </td>
      </tr>
    ));
  };


return (
    <>

      <div className="patients">

        <h2>Cola de Pacientes</h2>

        <div className="patients-container">

          {/* ENTRANTES */}
          <div className="patients-block pendiente">

            <h3>Entrante</h3>

            <table className="patients-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Nombre</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {renderTabla(entrantes, "entrante")}
              </tbody>

            </table>
          </div>

          {/* PENDIENTES */}
          <div className="patients-block atencion">

            <h3>En Espera</h3>

            <table className="patients-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Nombre</th>
                  <th>Prioridad</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {renderTabla(pendientes, "pendiente")}
              </tbody>

            </table>
          </div>

          {/* EN ATENCIÓN */}
          <div className="patients-block finalizado">

            <h3>En Atención</h3>

            <table className="patients-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Nombre</th>
                  <th>Prioridad</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {renderTabla(enAtencion, "enAtencion")}
              </tbody>

            </table>
          </div>

        </div>
      </div>

      {/* MODAL */}
      <TriajeModal
        isOpen={modalOpen}
        caso={casoSeleccionado}
        onClose={() => setModalOpen(false)}
        onSuccess={obtenerDatos}
      />

    </>
  );
}