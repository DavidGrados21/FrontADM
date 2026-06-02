import { useState } from "react";
import "./IMCCalculator.css";

export default function IMCCalculator({ peso, altura }) {

  const [imc, setImc] = useState(null);
  const [mostrar, setMostrar] = useState(false);

  const calcularIMC = () => {

    const p = parseFloat(peso);
    const a = parseFloat(altura);

    if (
      isNaN(p) ||
      isNaN(a) ||
      p <= 0 ||
      a <= 0
    ) {
      alert("Ingrese peso y altura válidos");
      return;
    }

    const resultado = p / (a * a);

    setImc(resultado.toFixed(2));
    setMostrar(true);
  };

  const obtenerClasificacion = () => {

    if (!imc) return "";

    const valor = parseFloat(imc);

    if (valor < 18.5) return "Bajo peso";
    if (valor < 25) return "Normal";
    if (valor < 30) return "Sobrepeso";
    if (valor < 35) return "Obesidad I";
    if (valor < 40) return "Obesidad II";

    return "Obesidad III";
  };

  return (

    <div className="imcCalc-container">

      <button
        type="button"
        className="imcCalc-btnOpen"
        onClick={calcularIMC}
      >
        Calcular IMC
      </button>

      {mostrar && (

        <div className="imcCalc-overlay">

          <div className="imcCalc-modal">

            <h4 className="imcCalc-title">
              Resultado IMC
            </h4>

            <p className="imcCalc-text">
              <strong>IMC:</strong> {imc}
            </p>

            <p className="imcCalc-text">
              <strong>Clasificación:</strong>{" "}
              {obtenerClasificacion()}
            </p>

            <button
              type="button"
              className="imcCalc-btnClose"
              onClick={() => setMostrar(false)}
            >
              Cerrar
            </button>

          </div>

        </div>
      )}

    </div>
  );
}