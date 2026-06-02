import {useEffect,useState} from "react";
import { api } from "../../../../api/api";
import "./ExpandRow.css";
import EditPatientModal from "../ModalEditarPaciente/EditPatientModal";

export default function ExpandRow({
  pacienteId,
  columns = 5,
}) {

  /* =========================
     STATES
  ========================= */

  const [paciente, setPaciente] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showEdit, setShowEdit] =
    useState(false);

  /* =========================
     OBTENER PACIENTE
  ========================= */

  const obtenerPaciente =
    async () => {

      try {

        setLoading(true);

        const response =
          await api.get(
            `/pacientes/${pacienteId}`
          );

        setPaciente(
          response.data
        );

      } catch (error) {

        console.error(
          "Error obteniendo paciente:",
          error.response?.data ||
            error.message
        );

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     FETCH
  ========================= */

  useEffect(() => {

    let mounted = true;

    const fetchPaciente =
      async () => {

        try {

          setLoading(true);

          const response =
            await api.get(
              `/pacientes/${pacienteId}`
            );

          if (mounted) {

            setPaciente(
              response.data
            );

          }

        } catch (error) {

          console.error(
            "Error obteniendo paciente:",
            error.response?.data ||
              error.message
          );

        } finally {

          if (mounted) {
            setLoading(false);
          }

        }

      };

    if (pacienteId) {
      fetchPaciente();
    }

    return () => {
      mounted = false;
    };

  }, [pacienteId]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <tr className="er-expanded-row">

        <td colSpan={columns}>

          <div className="er-expanded-content">

            Cargando...

          </div>

        </td>

      </tr>

    );

  }

  /* =========================
     SIN PACIENTE
  ========================= */

  if (!paciente) {

    return (

      <tr className="er-expanded-row">

        <td colSpan={columns}>

          <div className="er-expanded-content">

            No se encontró información.

          </div>

        </td>

      </tr>

    );

  }

  /* =========================
     FECHA
  ========================= */

  const fechaNacimiento =
    paciente.fecha_nacimiento
      ? new Date(
          paciente.fecha_nacimiento
        ).toLocaleDateString()
      : "-";

  return (

    <>

      {/* =====================
          FILA EXPANDIDA
      ===================== */}

      <tr className="er-expanded-row">

        <td colSpan={columns}>

          <div className="er-expanded-content">

            <div className="er-columns">

              {/* =====================
                  DATOS PERSONALES
              ===================== */}

              <div className="er-section">

                <h3>
                  DATOS PERSONALES
                </h3>

                <div className="er-grid">

                  <p>
                    <strong>ID:</strong>
                    {" "}
                    {paciente.id}
                  </p>

                  <p>
                    <strong>DNI:</strong>
                    {" "}
                    {paciente.dni}
                  </p>

                  <p>
                    <strong>Nombre:</strong>
                    {" "}
                    {paciente.nombre}
                  </p>

                  <p>
                    <strong>
                      Fecha Nacimiento:
                    </strong>
                    {" "}
                    {fechaNacimiento}
                  </p>

                  <p>
                    <strong>Sexo:</strong>
                    {" "}
                    {paciente.sexo}
                  </p>

                </div>

              </div>

              {/* =====================
                  INFO ADICIONAL
              ===================== */}

              <div className="er-section">

                <h3>
                  INFORMACIÓN ADICIONAL
                </h3>

                <div className="er-grid">

                  <p>
                    <strong>
                      Teléfono:
                    </strong>
                    {" "}
                    {
                      paciente.telefono ||
                      "-"
                    }
                  </p>

                  <p>
                    <strong>
                      Dirección:
                    </strong>
                    {" "}
                    {
                      paciente.direccion ||
                      "-"
                    }
                  </p>

                  <p>
                    <strong>
                      Tipo Sangre:
                    </strong>
                    {" "}
                    {
                      paciente.tipo_sangre ||
                      "-"
                    }
                  </p>

                  <p>
                    <strong>
                      Tiene Tatuajes:
                    </strong>
                    {" "}
                    {
                      paciente.tiene_tatuajes
                        ? "Sí"
                        : "No"
                    }
                  </p>

                  <p>
                    <strong>
                      Religión:
                    </strong>
                    {" "}
                    {
                      paciente.religion ||
                      "-"
                    }
                  </p>

                  <p>
                    <strong>
                      Contacto Emergencia:
                    </strong>
                    {" "}
                    {
                      paciente.contacto_emergencia ||
                      "-"
                    }
                  </p>

                </div>

              </div>

              {/* =====================
                  ACCIONES
              ===================== */}

              <div
                className="
                  er-section
                  er-actions
                "
              >

                <h3>
                  ACCIONES
                </h3>

                <button
                  type="button"
                  className="er-edit-btn"
                  onClick={() =>
                    setShowEdit(true)
                  }
                >
                  EDITAR
                </button>

              </div>

            </div>

          </div>

        </td>

      </tr>

      {/* =====================
          MODAL FUERA DEL TR
      ===================== */}

      <EditPatientModal
        isOpen={showEdit}
        onClose={() =>
          setShowEdit(false)
        }
        patient={paciente}
        onUpdate={obtenerPaciente}
      />

    </>

  );

}