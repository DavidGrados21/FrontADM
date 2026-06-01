import { useState, useEffect } from "react";
import { api } from "../../../api/api";
import "./TriajeModal.css";
import IMCCalculator from "../IMCCalculator/IMCCalculator";


export default function TriajeModal({
  isOpen,
  onClose,
  caso,
  onSuccess,
}) {
  const [diccionario, setDiccionario] = useState([]);

  const [sugerencias, setSugerencias] = useState([]);

  const [prioridad, setPrioridad] = useState(null);
  const [area, setArea] = useState(null);

  const [loadingIA, setLoadingIA] = useState(false);

  const [form, setForm] = useState({
    sintomas: "",
    peso: "",
    altura: "",
  });

  const [errors, setErrors] = useState({});

  const obtenerClaseESI = (nivel) => {
    switch (Number(nivel)) {
      case 1:
        return "esi-1";

      case 2:
        return "esi-2";

      case 3:
        return "esi-3";

      case 4:
        return "esi-4";

      case 5:
        return "esi-5";

      default:
        return "";
    }
  };

  // =========================
  // CARGAR SINTOMAS
  // =========================

  useEffect(() => {
    fetch("/sintomas.txt")
      .then((res) => res.text())
      .then((data) => {
        const lista = data
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(
            (item) => item !== ""
          );

        setDiccionario(lista);
      })
      .catch((error) => {
        console.log( "Error cargando síntomas:", error);
      });
  }, []);

  // =========================
  // RESET FORM
  // =========================

  useEffect(() => {
    if (caso) {
      setForm({
        sintomas: "",
        peso: "",
        altura: "",
      });

      setErrors({});
      setSugerencias([]);
      setPrioridad(null);
      setArea(null);
    }
  }, [caso]);

  // =========================
  // NORMALIZAR
  // =========================

  const normalizar = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );
  };

  // =========================
  // BUSCAR SINTOMAS
  // =========================

  const buscarSintomas = (texto) => {
    const lineas = texto.split("\n");

    const ultimaLinea =
      lineas[lineas.length - 1];

    if (!texto.trim()) {
      setSugerencias([]);
      return;
    }

    const resultados =
      diccionario.filter((item) =>
        normalizar(item).includes(
          normalizar(ultimaLinea)
        )
      );

    setSugerencias(
      resultados.slice(0, 5)
    );
  };

  // =========================
  // SELECCIONAR SINTOMA
  // =========================

  const seleccionarSintoma = (
    sintoma
  ) => {
    const lineas =
      form.sintomas.split("\n");

    lineas[lineas.length - 1] =
      sintoma;

    setForm((prev) => ({
      ...prev,
      sintomas:
        lineas.join("\n") + "\n",
    }));

    setSugerencias([]);
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    const newForm = {
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    };

    setForm(newForm);

    if (name === "sintomas") {buscarSintomas(value);}
  };

  // =========================
  // CLASIFICAR TRIAJE IA
  // =========================

  const clasificarTriaje = async ( sintomas ) => {
    if ( !sintomas || sintomas.trim().length < 5) {
      setPrioridad(null);
      setArea(null);
      return;
    }

    try {
      setLoadingIA(true);

      const [triajeResponse, areaResponse] = await Promise.all([
        api.post("/triaje/clasificar-triaje", { sintomas, }),
        api.post("/triaje/clasificar-area", { sintomas, }),
      ]);

      setPrioridad(triajeResponse.data.prioridad);
      setArea(areaResponse.data.area);

      setErrors({});
    } 
    
    catch (error) {
      console.log( "Error IA:", error.response?.data || error );

      setPrioridad(null);
      setArea(null);

    } finally {
      setLoadingIA(false);
    }
  };

  // =========================
  // VALIDAR
  // =========================

  const validar = () => {
    const newErrors = {};

    if (!form.sintomas || form.sintomas.trim() 
      .length < 3
    ) 
    {
      newErrors.sintomas = "Síntomas requeridos";
    }

    const peso = Number( form.peso );

    if ( isNaN(peso) || peso <= 0 || peso > 300)
    {
      newErrors.peso = "Peso inválido";
    }

    const altura = Number(form.altura);

    if (
      isNaN(altura) ||
      altura <= 0 ||
      altura > 2.5
    ) {
      newErrors.altura ="Altura inválida";
    }

    if (prioridad === null || prioridad === undefined) 
    {
      newErrors.prioridad ="La IA aún no clasifica el caso";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {
    if (!validar()) return;

    try {
      if (!caso?.caso_id) 
      {
        alert("Caso inválido");
        return;
      }
      const payload = {
        sintomas: form.sintomas.trim(), 
        altura: Number(form.altura),
        peso: Number(form.peso),
        prioridad_ia:Number(prioridad),};

      console.log("Payload enviado:",payload);

      const response = await api.put(`/triaje/${caso.caso_id}`,payload);

      console.log("Respuesta guardar:",response.data);

      onSuccess();
      onClose();
    } catch (e) {
      console.log("Error guardar:",e.response?.data || e);
      alert("Error al guardar triaje");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="triaje-modal-overlay">
      <div className="triaje-modal-content">
        <h2 className="triaje-modal-title"> Triaje del Paciente</h2>

        <p className="triaje-modal-paciente">
          <strong>Nombre:</strong> {caso?.nombre}
        </p>

        <div className="triaje-modal-grid">
          {/* IZQUIERDA */}

          <div className="triaje-modal-left">
            <label className="triaje-modal-label"> Síntomas </label>

            <div className="triaje-textarea-wrapper">
              <textarea
                className="triaje-modal-textarea"
                name="sintomas"
                placeholder="Describa los síntomas..."
                value={form.sintomas}
                onChange={handleChange}
              />

              {sugerencias.length > 0 && (
                <div className="triaje-sugerencias" >
                  {sugerencias.map((item) => (
                    <div
                      key={item}
                      className="triaje-sugerencia-item"
                      onClick={() => seleccionarSintoma(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DERECHA */}
          <div className="triaje-modal-right">
            <div className="triaje-modal-form-row">
              <label className="triaje-modal-label"> Peso </label>
              <input
                className="triaje-modal-input"
                name="peso"
                type="number"
                step="0.01"
                placeholder="kg"
                value={form.peso}
                onChange={handleChange}
              />
            </div>

            {errors.peso && (
              <small className="triaje-modal-error"> {errors.peso} </small>
            )}

            {/* ALTURA */}

            <div className="triaje-modal-form-row">
              <label className="triaje-modal-label"> Altura </label>
              <input
                className="triaje-modal-input"
                name="altura"
                type="number"
                step="0.01"
                placeholder="m"
                value={form.altura}
                onChange={handleChange}
              />
            </div>

            {errors.altura && (
              <small className="triaje-modal-error">
                {errors.altura}
              </small>
            )}

            <IMCCalculator peso={form.peso} altura={form.altura} />

            {/* BOTON IA */}
            <button
              className="triaje-btn-ia"
              onClick={() => clasificarTriaje(form.sintomas)}
              disabled={loadingIA}
            >
              {loadingIA ? "Clasificando..." : "Clasificar con IA"}
            </button>

            {errors.prioridad && (
              <small className="triaje-modal-error">
                {errors.prioridad}
              </small>
            )}

            {loadingIA && (
               <div className="triaje-loading">
                 <div className="triaje-spinner"></div>
                 <span>Analizando síntomas...</span>
              </div>
            )}

            {prioridad !== null && !loadingIA && (
              <div className="triaje-ia-result">
                <h3>Prioridad IA</h3>
                <p className={obtenerClaseESI(prioridad)}> Nivel ESI: {prioridad}</p>
              </div>
            )}

            {area !== null && !loadingIA && (
              <div className="triaje-ia-result">
                <h3>Area designada</h3>

                <div className="triaje-especialidad-doctores">
                  <p className="triaje-especialidad-text">
                    {area}
                  </p>
                </div>
              </div>
            )} 

            <div className="triaje-modal-actions">
              <button
                className="triaje-modal-btn-save"
                onClick={guardar}
              >
                Guardar
              </button>

              <button
                className="triaje-modal-btn-cancel"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}