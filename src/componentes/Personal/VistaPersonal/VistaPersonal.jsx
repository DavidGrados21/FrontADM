import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import ColaPacientes from "../ColaPacientes/ColaPacientes";
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

      {view !== "dashboard" && (
        <>
          <Sidebar setView={setView} />

          <FloatingButton
            onClick={() => setOpenPacienteModal(true)}
          />

          <ModalPaciente
            isOpen={openPacienteModal}
            onClose={() => setOpenPacienteModal(false)}
            onSave={() => setReload((prev) => prev + 1)}
          />
        </>
      )}

      <main className="content-area">
        {view === "patients" && <ColaPacientes />}
        {view === "dashboard" && <Dashboard />}
        {view === "paciente" && <Pacientes />}
      </main>

      <ModalPaciente
        isOpen={openPacienteModal}
        onClose={() => setOpenPacienteModal(false)}
        onSave={() => setReload((prev) => prev + 1)}
      />

    </div>
  );
}