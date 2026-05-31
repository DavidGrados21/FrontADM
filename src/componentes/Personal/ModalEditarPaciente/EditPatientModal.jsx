import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./EditPatientModal.css";
import { api } from "../../../api/api";

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
  });

  /* =========================
     CARGAR PACIENTE
  ========================= */

  useEffect(() => {
    if (!patient) return;

    setForm({
      telefono: patient.telefono ?? "",
      direccion: patient.direccion ?? "",
      tipo_sangre: patient.tipo_sangre ?? "",
      religion: patient.religion ?? "",
      contacto_emergencia: patient.contacto_emergencia ?? "",
    });
  }, [patient?.id]);

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

      await api.put(`/pacientes/${patient.id}`, form);

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
    ? new Date(patient.fecha_nacimiento).toLocaleDateString()
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
              <p>DNI: {patient.dni}</p>
              <p>Nombre: {patient.nombre}</p>
              <p>Sexo: {patient.sexo}</p>
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
                <label>Religión</label>
                <input
                  name="religion"
                  value={form.religion}
                  onChange={epmHandleChange}
                  className="epm-input"
                />
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