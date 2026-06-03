import { useEffect, useState } from "react";
import ModalDescrip from "./ModalDescricpcion/modalDescrip";
import { api } from "../../../api/api";
import "./ColaPacientesDoctor.css";

export default function ColaPacientesDoctor({ idDoctor }) {
  const [pendientes, setPendientes] = useState([]);
  const [enAtencion, setEnAtencion] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);

  const abrirModal = (caso) => {
    setCasoSeleccionado(caso);
    setModalOpen(true);
  };

  const Descrip = (caso) => {
    setCasoSeleccionado(caso);
    setMostrarModal(true);
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
      const resAtn = await api.get(`/doctor/${idDoctor}/casos/pendiente`);
      setPendientes(resAtn.data.casos || []);
    } catch (error) {console.error("Error pendientes:", error);}

    try {
      const resFin = await api.get(`/doctor/${idDoctor}/casos/en_atencion`);
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
        </div>
      </div>

      <ModalDescrip
        abierto={mostrarModal}
        casoId={casoSeleccionado}
        onClose={() => setMostrarModal(false)}
      />

    </>
  );
}