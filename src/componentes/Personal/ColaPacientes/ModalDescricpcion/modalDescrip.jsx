import { useEffect, useState } from "react";
import {api} from "../../../../api/api";
import "./modalDescrip.css";

function ModalDescrip({ abierto, casoId, onClose }) {
  const [sintomas, setSintomas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!abierto || !casoId) return;

    const cargarDescripcion = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/descripcion/${casoId}`);

        setSintomas(res.data.sintomas || "Sin descripción registrada.");
      } catch (error) {
        console.error(error);
        setSintomas("Error al cargar los síntomas.");
      } finally {
        setLoading(false);
      }
    };

    cargarDescripcion();
  }, [abierto, casoId]);

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-sintomas">
        <h3>Síntomas</h3>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <p>{sintomas}</p>
        )}

        <button onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default ModalDescrip;