import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import ColaPacientesPrincipal from "../ColaPacientes/ColaPacientesPrincipal";
import Pacientes from "../Paciente/Paciente";
import FloatingButton from "../FloatingButton/FloatingButton";
import ModalPaciente from "../ModalPaciente/ModalPaciente";
import Dashboard from "../Dashboard/Dashboard";

export default function VistaPersonal() {
  const [view, setView] = useState("patients");
  const [openPacienteModal, setOpenPacienteModal] = useState(false);
  const [reload, setReload] = useState(0);

  return (
    <div className="app-container">

      <Sidebar setView={setView} />

      <main className="content-area">

        {view === "patients" && <ColaPacientesPrincipal/>}

        {view === "dashboard" && <Dashboard />}

        {view === "paciente" && <Pacientes />}

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