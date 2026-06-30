import { useState, useEffect } from "react";
import { api } from "../../../api/api";
import "./ModalPaciente.css";

export default function ModalPaciente({
  isOpen,
  onClose,
  onSave,
}) {

  const [form, setForm] = useState({
    tipoDocumento: "dni",
    dni: "",
    nombre: "",
    sexo: "",
    fecha_nacimiento: "",
    origen : "",
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
        tipoDocumento: "dni",
        dni: "",
        nombre: "",
        sexo: "M",
        fecha_nacimiento: "",
        origen : "",
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
  const consultarDocumento  = async () => {

    const documento  = form.dni.trim();

    // VALIDAR DNI
    if (form.tipoDocumento === "dni") {
      if (!/^\d{8}$/.test(documento)) {

        setErrors({
          ...errors,
          dni: "DNI debe tener 8 dígitos numéricos",
        });

        return;
      }
    } else {

      if (!/^\d{1,9}$/.test(documento)) {

        setErrors({
          ...errors,
          dni: "CEE inválido",
        });

        return;
      }
    }

    try {

      setLoadingDni(true);

      setErrors({
        dni: "",
        nombre: "",
      });

      const endpoint =
        form.tipoDocumento === "dni"
          ? `/consultar-dni/${documento}`
          : `/consultar-cee/${documento}`;

      const response = await api.get(endpoint);
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
        nombre: `Error al consultar ${form.tipoDocumento.toUpperCase()}`,
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

    if (form.tipoDocumento === "dni") {

      if (!/^\d{8}$/.test(dni)) {
        newErrors.dni = "DNI debe tener 8 dígitos numéricos";
      }

    } else {

      if (!/^\d{1,9}$/.test(dni)) {
        newErrors.dni = "CEE inválido";
      }

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
        origen : form.origen,
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

        {/* DOCUMENTO */}
        <div className="documento-row">

          <select
            name="tipoDocumento"
            value={form.tipoDocumento}
            onChange={handleChange}
          >
            <option value="dni">DNI</option>
            <option value="cee">CEE</option>
          </select>

          <input
            name="dni"
            placeholder={
              form.tipoDocumento === "dni"
                ? "DNI"
                : "Carné de Extranjería"
            }
            value={form.dni}
            onChange={handleChange}
            maxLength={
              form.tipoDocumento === "dni"
                ? 8
                : 9
            }
            inputMode="numeric"
          />

        </div>

        {errors.dni && (
          <small className="modal-paciente-error">
            {errors.dni}
          </small>
        )}

        {/* BOTÓN CONSULTAR */}
        <button
          className="modal-paciente-btn-search"
          onClick={consultarDocumento}
          disabled={loadingDni}
        >
          {loadingDni
            ? "Consultando..."
            : "Consultar"}
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

        <label>FECHA NACIMIENTO</label>

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

        <label>SEXO </label>

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

        <label>ORIGEN </label>

        {/* ORIGEN */}
        <select
          name="origen"
          value={form.origen}
          onChange={handleChange}
        >
          <option value="Presencial">
            Presencial
          </option>

          <option value="Pre-arribo">
            Pre-arribo
          </option>

          <option value="Referencia">
            Referencia
          </option>

          <option value="Ambulancia / SAMU">
            Ambulancia / SAMU
          </option>
        </select>

        {errors.origen && (
          <small className="modal-paciente-error">
            {errors.origen}
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