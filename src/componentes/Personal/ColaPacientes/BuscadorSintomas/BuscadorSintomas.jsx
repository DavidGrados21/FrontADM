import { useEffect, useState } from "react";

export default function BuscadorSintomas() {
  const [diccionario, setDiccionario] = useState([]);
  const [texto, setTexto] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    fetch("/sintomas.txt")
      .then((res) => res.text())
      .then((data) => {
        const lista = data
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item !== "");

        setDiccionario(lista);
      });
  }, []);

  function normalizar(valor) {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function buscar(valor) {
    setTexto(valor);

    if (!valor.trim()) {
      setSugerencias([]);
      return;
    }

    const resultados = diccionario.filter((item) =>
      normalizar(item).includes(normalizar(valor))
    );

    setSugerencias(resultados);
  }

  return (
    <div style={{ width: "400px" }}>
      <input
        type="text"
        value={texto}
        onChange={(e) => buscar(e.target.value)}
        placeholder="Buscar síntoma"
      />

      <div>
        {sugerencias.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              setTexto(item);
              setSugerencias([]);
            }}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}