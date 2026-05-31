import "./FloatingButton.css";
import icono from "../../../assets/icono.png";

export default function FloatingButton({ onClick }) {
  return (
    <button
      className="floating-button"
      onClick={onClick}
      title="Agregar paciente"
    >
      <img src={icono} alt="Agregar paciente" className="floating-icon" />
    </button>
  );
}