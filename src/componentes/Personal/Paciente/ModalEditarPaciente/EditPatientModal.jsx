import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./EditPatientModal.css";
import { api } from "../../../../api/api";

function EditPatientModal({
  isOpen,
  onClose,
  patient,
  onUpdate,
}) {
  /* =========================
     STATES
  ========================= */

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    telefono: "",
    direccion: "",
    tipo_sangre: "",
    religion: "",
    contacto_emergencia: "",
    tiene_tatuajes: false,
  });

  /* =========================
     CARGAR PACIENTE
  ========================= */

  useEffect(() => {
    if (!patient) return;

    setForm({
      telefono: patient.telefono_paciente ?? "",
      direccion: patient.direccion_paciente ?? "",
      tipo_sangre: patient.tipo_sangre_paciente ?? "",
      religion: patient.religion_paciente ?? "",
      contacto_emergencia: patient.contacto_emergencia_paciente ?? "",
      tiene_tatuajes: patient.tiene_tatuajes_paciente ?? false,
    });
  }, [patient]);

  /* =========================
     ESC CERRAR
  ========================= */

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* =========================
     HANDLE INPUTS
  ========================= */

  const epmHandleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const onlyNumbers = value.replace(/\D/g, "");
      const limited = onlyNumbers.slice(0, 9);

      setForm((prev) => ({
        ...prev,
        telefono: limited,
      }));

      return;
    }

    if (name === "contacto_emergencia") {
      const onlyNumbers = value.replace(/\D/g, "");
      const limited = onlyNumbers.slice(0, 9);

      setForm((prev) => ({
        ...prev,
        contacto_emergencia: limited,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     VALIDACIÓN
  ========================= */

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^[0-9]{9}$/;

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!phoneRegex.test(form.telefono)) {
      newErrors.telefono = "Debe tener 9 dígitos";
    }

    if (
      form.contacto_emergencia &&
      !phoneRegex.test(form.contacto_emergencia)
    ) {
      newErrors.contacto_emergencia = "Debe tener 9 dígitos";
    }

    if (form.direccion && form.direccion.length < 5) {
      newErrors.direccion = "La dirección es muy corta";
    }

    if (!form.tipo_sangre) {
      newErrors.tipo_sangre = "Seleccione un tipo de sangre";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================
     SUBMIT
  ========================= */

  const epmHandleSubmit = async () => {
    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.put(`/pacientes/${patient.dni_paciente}`, form);

      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FECHA
  ========================= */

  const fechaNacimiento = patient.fecha_nacimiento
    ? new Date(patient.fecha_nacimiento_paciente).toLocaleDateString()
    : "-";

  /* =========================
     NO RENDER
  ========================= */

  if (!isOpen || !patient) return null;

  /* =========================
     UI
  ========================= */

  return createPortal(
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-box" onClick={(e) => e.stopPropagation()}>

        <button className="epm-close-btn" onClick={onClose}>
          ×
        </button>

        <h2 className="epm-title">Editar Paciente</h2>

        <div className="epm-columns">

          {/* IZQUIERDA */}
          <div className="epm-column">
            <h3 className="epm-section-title">Datos Personales</h3>

            <div className="epm-static-info">
              <p>DNI: {patient.dni_paciente}</p>
              <p>Nombre: {patient.nombre_paciente}</p>
              <p>Sexo: {patient.sexo_paciente}</p>
              <p>Fecha: {fechaNacimiento}</p>
            </div>
          </div>

          {/* DERECHA */}
          <div className="epm-column">
            <h3 className="epm-section-title">Información Editable</h3>

            <div className="epm-form-grid">

              {/* TELEFONO */}
              <div className="epm-input-group">
                <label>Teléfono</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={epmHandleChange}
                  className="epm-input"
                />
                {errors.telefono && (
                  <span className="epm-error">{errors.telefono}</span>
                )}
              </div>

              {/* DIRECCION */}
              <div className="epm-input-group">
                <label>Dirección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={epmHandleChange}
                  className="epm-input"
                />
                {errors.direccion && (
                  <span className="epm-error">{errors.direccion}</span>
                )}
              </div>

              {/* TIPO SANGRE */}
              <div className="epm-input-group">
                <label>Tipo Sangre</label>

                <select
                  name="tipo_sangre"
                  value={form.tipo_sangre}
                  onChange={epmHandleChange}
                  className="epm-input"
                >
                  <option value="">Seleccione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>

                {errors.tipo_sangre && (
                  <span className="epm-error">{errors.tipo_sangre}</span>
                )}
              </div>

              {/* RELIGION */}
              <div className="epm-input-group">
                <label>¿Es Testigo de Jehová?</label>
                <select
                  name="testigo_jehova"
                  value={form.religion || ""}
                  onChange={epmHandleChange}
                  className="epm-input"
                >
                  <option value="">Seleccione</option>
                  <option value="Testigo">Sí</option>
                  <option value="Otro">No</option>
               </select>
              </div>

              {/* CONTACTO EMERGENCIA */}
              <div className="epm-input-group">
                <label>Contacto Emergencia</label>
                <input
                  name="contacto_emergencia"
                  value={form.contacto_emergencia}
                  onChange={epmHandleChange}
                  className="epm-input"
                />
                {errors.contacto_emergencia && (
                  <span className="epm-error">
                    {errors.contacto_emergencia}
                  </span>
                )}
              </div>

              {/* TIENE TATUAJES */}
              <div className="epm-input-group">
                <label htmlFor="tiene_tatuajes">Tiene tatuajes</label>

                <select
                  id="tiene_tatuajes"
                  className="epm-input"
                  value={
                    form.tiene_tatuajes === true
                      ? "true"
                      : form.tiene_tatuajes === false
                      ? "false"
                      : ""
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tiene_tatuajes: e.target.value === "true",
                    }))
                  }
                >
                  <option value="">Seleccione una opción</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="epm-actions">
          <button onClick={onClose}>Cancelar</button>

          <button onClick={epmHandleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
export default EditPatientModal;