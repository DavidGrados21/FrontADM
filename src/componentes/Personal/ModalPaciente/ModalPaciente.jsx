import { useState, useEffect } from "react";
import { api } from "../../../api/api";
import "./ModalPaciente.css";

export default function ModalPaciente({
  isOpen,
  onClose,
  onSave,
}) {

  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    sexo: "M",
    fecha_nacimiento: "",
  });

  const [errors, setErrors] = useState({});

  const [loadingDni, setLoadingDni] =
    useState(false);

  // =========================
  // RESET MODAL
  // =========================
  useEffect(() => {

    if (!isOpen) {

      setForm({
        dni: "",
        nombre: "",
        sexo: "M",
        fecha_nacimiento: "",
      });

      setErrors({});
    }

  }, [isOpen]);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {

    const { name, value } = e.target;

    // SOLO NÚMEROS DNI
    if (name === "dni") {

      const soloNumeros =
        value.replace(/\D/g, "");

      setForm((prev) => ({
        ...prev,
        dni: soloNumeros,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CONSULTAR DNI
  // =========================
  const consultarDni = async () => {

    const dni = form.dni.trim();

    // VALIDAR DNI
    if (!/^\d{8}$/.test(dni)) {

      setErrors({
        ...errors,
        dni:
          "DNI debe tener 8 dígitos numéricos",
      });

      return;
    }

    try {

      setLoadingDni(true);

      // LIMPIAR ERRORES
      setErrors({
        dni: "",
        nombre: "",
      });

      const response = await api.get(
        `/consultar-dni/${dni}`
      );

      const data = response.data;

      console.log(data);

      if (data.success) {

        setForm((prev) => ({
          ...prev,
          nombre: data.nombre,
        }));

      } else {

        setForm((prev) => ({
          ...prev,
          nombre: "",
        }));

        setErrors({
          nombre:
            data.message || "No encontrado",
        });
      }

    } catch (error) {

      console.log(error);

      setErrors({
        nombre: "Error al consultar DNI",
      });

    } finally {

      setLoadingDni(false);
    }
  };

  // =========================
  // VALIDAR
  // =========================
  const validar = () => {

    const newErrors = {};

    const dni = form.dni.trim();

    const nombre =
      form.nombre.trim();

    if (!/^\d{8}$/.test(dni)) {

      newErrors.dni =
        "DNI debe tener 8 dígitos numéricos";
    }

    if (nombre.length < 3) {

      newErrors.nombre =
        "Debe consultar el DNI";
    }

    if (!form.fecha_nacimiento) {

      newErrors.fecha_nacimiento =
        "Seleccione fecha nacimiento";
    }

    if (!["M", "F"].includes(form.sexo)) {

      newErrors.sexo =
        "Sexo inválido";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {

    if (!validar()) return;

    try {

      let fechaFormateada = "";

      if (form.fecha_nacimiento) {

        const [year, month, day] =
          form.fecha_nacimiento.split("-");

        fechaFormateada =
          `${day}/${month}/${year}`;
      }

      await api.post("/pacientes", {
        dni: form.dni,
        nombre: form.nombre,
        sexo: form.sexo,
        fecha_nacimiento:
          fechaFormateada,
      });

      onSave();

      onClose();

    } catch (error) {

      console.log(error);

      alert(
        "Error al guardar paciente"
      );
    }
  };

  if (!isOpen) return null;

  return (

    <div className="modal-paciente-overlay">

      <div className="modal-paciente-content">

        <h3>Nuevo Paciente</h3>

        {/* DNI */}
        <input
          name="dni"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
          maxLength={8}
          inputMode="numeric"
        />

        {errors.dni && (
          <small className="modal-paciente-error">
            {errors.dni}
          </small>
        )}

        {/* BOTÓN CONSULTAR */}
        <button
          className="modal-paciente-btn-search"
          onClick={consultarDni}
          disabled={loadingDni}
        >
          {loadingDni
            ? "Consultando..."
            : "Consultar DNI"}
        </button>

        {/* NOMBRE */}
        <input
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          disabled
        />

        {errors.nombre && (
          <small className="modal-paciente-error">
            {errors.nombre}
          </small>
        )}

        {/* FECHA NACIMIENTO */}
        <input
          type="date"
          name="fecha_nacimiento"
          value={form.fecha_nacimiento}
          onChange={handleChange}
        />

        {errors.fecha_nacimiento && (
          <small className="modal-paciente-error">
            {errors.fecha_nacimiento}
          </small>
        )}

        {/* SEXO */}
        <select
          name="sexo"
          value={form.sexo}
          onChange={handleChange}
        >
          <option value="M">
            Masculino
          </option>

          <option value="F">
            Femenino
          </option>
        </select>

        {errors.sexo && (
          <small className="modal-paciente-error">
            {errors.sexo}
          </small>
        )}

        <div className="modal-paciente-actions">

          <button
            className="modal-paciente-btn-save"
            onClick={guardar}
          >
            Guardar
          </button>

          <button
            className="modal-paciente-btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>

        </div>

      </div>

    </div>
  );
}