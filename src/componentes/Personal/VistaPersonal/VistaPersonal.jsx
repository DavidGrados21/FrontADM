import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import ColaPacientesPrincipal from "../ColaPacientes/ColaPacientesPrincipal";
import ColaPacientesDoctor from "../ColaPacientesDoctor/ColaPacientesDoctor";
import Pacientes from "../Paciente/Paciente";
import FloatingButton from "../FloatingButton/FloatingButton";
import ModalPaciente from "../ModalPaciente/ModalPaciente";
import Dashboard from "../Dashboard/Dashboard";

export default function VistaPersonal({ idDoctor }) {
  const [view, setView] = useState("patients");
  const [openPacienteModal, setOpenPacienteModal] = useState(false);
  const [reload, setReload] = useState(0);

  return (
    <div className="app-container">

      <Sidebar setView={setView} />

      <main className="content-area">
        {view === "patients" && 
          (idDoctor === 0 ? (
            <ColaPacientesPrincipal />
          ) : (
            <ColaPacientesDoctor idDoctor={idDoctor} />
        ))}

        {view === "dashboard" && idDoctor === 0 && <Dashboard />}

        {view === "paciente" && idDoctor === 0 && <Pacientes />}

      </main>

      <FloatingButton onClick={() => setOpenPacienteModal(true)} />

      <ModalPaciente
        isOpen={openPacienteModal}
        onClose={() => setOpenPacienteModal(false)}
        onSave={() => setReload((prev) => prev + 1)}
      />

    </div>
  );
}