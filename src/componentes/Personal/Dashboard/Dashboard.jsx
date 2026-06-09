import { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/api";
import "./Dashboard.css";

// ─── helpers ───────────────────────────────────────────────────────────────
const PRIORIDAD_LABEL = ["", "I", "II", "III", "IV", "V"];
const PRIORIDAD_COLOR = ["", "#e53e3e", "#ed8936", "#ecc94b", "#48bb78", "#63b3ed"];

function ahora() {
  return new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── sub-componentes ────────────────────────────────────────────────────────
function KpiCard({ label, value, unit = "", color = "#3b82f6", sub }) {
  return (
    <div className="dash-kpi-card">
      <span className="dash-kpi-label">{label}</span>
      <span className="dash-kpi-value" style={{ color }}>{value}</span>
      {unit && <span className="dash-kpi-unit">{unit}</span>}
      {sub && <span className="dash-kpi-sub">{sub}</span>}
    </div>
  );
}

function SectionCard({ title, children, loading }) {
  return (
    <div className="dash-section-card">
      <div className="dash-section-header">
        <h3>{title}</h3>
        {loading && <span className="dash-spinner" />}
      </div>
      <div className="dash-section-body">{children}</div>
    </div>
  );
}

// Barra de flujo de pacientes
function FlujoBarra({ flujo }) {
  const estados = ["entrante", "pendiente", "en_atencion", "finalizado"];
  const colores = { entrante: "#63b3ed", pendiente: "#ecc94b", en_atencion: "#ed8936", finalizado: "#48bb78" };
  const etiquetas = { entrante: "Entrante", pendiente: "Pendiente", en_atencion: "En Atención", finalizado: "Finalizado" };

  const mapa = {};
  (flujo || []).forEach((f) => {
    const key = f.estado?.toLowerCase().replace(" ", "_");
    mapa[key] = f.total;
  });

  const max = Math.max(...estados.map((e) => mapa[e] || 0), 1);

  return (
    <div className="dash-flujo-wrap">
      {estados.map((e) => {
        const val = mapa[e] || 0;
        return (
          <div key={e} className="dash-flujo-col">
            <span className="dash-flujo-num">{val}</span>
            <div className="dash-flujo-bar-bg">
              <div
                className="dash-flujo-bar"
                style={{ height: `${(val / max) * 100}%`, background: colores[e] }}
              />
            </div>
            <span className="dash-flujo-label">{etiquetas[e]}</span>
          </div>
        );
      })}
    </div>
  );
}

// Gráfico de triaje
function TriajeChart({ porNivel, totalActivos }) {
  const max = Math.max(...(porNivel || []).map((n) => n.total), 1);
  return (
    <div className="dash-triaje-wrap">
      <div className="dash-triaje-total">
        <span className="dash-triaje-total-num">{totalActivos}</span>
        <span className="dash-triaje-total-label">Pacientes activos</span>
      </div>
      <div className="dash-triaje-bars">
        {(porNivel || []).map((n, i) => (
          <div key={i} className="dash-triaje-col">
            <span className="dash-triaje-num">{n.total}</span>
            <div className="dash-triaje-bar-bg">
              <div
                className="dash-triaje-bar"
                style={{ height: `${(n.total / max) * 100}%`, background: PRIORIDAD_COLOR[i + 1] }}
              />
            </div>
            <span className="dash-triaje-label" style={{ color: PRIORIDAD_COLOR[i + 1] }}>
              {n.nivel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mapa de camillas
function CamillasMapa({ camillas }) {
  if (!camillas?.length) return <p className="dash-empty">Sin datos de camillas</p>;
  return (
    <div className="dash-camillas-grid">
      {camillas.map((c) => (
        <div
          key={c.id}
          className={`dash-camilla ${c.ocupada ? "ocupada" : "libre"}`}
          title={`Camilla ${c.id} – ${c.ocupada ? "Ocupada" : "Libre"}`}
        >
          <span>{c.id}</span>
        </div>
      ))}
    </div>
  );
}

// Gráfico de línea (evolución de espera)
function LineChart({ datos }) {
  if (!datos?.length) return <p className="dash-empty">Sin datos en las últimas 24h</p>;

  const W = 340, H = 120, PAD = 24;
  const maxY = Math.max(...datos.map((d) => d.minutos), 1);
  const xs = datos.map((_, i) => PAD + (i / Math.max(datos.length - 1, 1)) * (W - PAD * 2));
  const ys = datos.map((d) => H - PAD - ((d.minutos / maxY) * (H - PAD * 2)));

  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${path} L${xs[xs.length - 1]},${H - PAD} L${xs[0]},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dash-linechart">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* threshold line */}
      <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="#e53e3e" strokeDasharray="4 3" strokeWidth="1" />
      <text x={W - PAD + 2} y={H / 2 + 4} fontSize="8" fill="#e53e3e">Umbral</text>
      {/* area + line */}
      <path d={area} fill="url(#areaGrad)" />
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      {/* puntos */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill="#3b82f6" />
      ))}
      {/* eje x */}
      {datos.map((d, i) => (
        i % Math.ceil(datos.length / 4) === 0 && (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">
            {d.hora}
          </text>
        )
      ))}
    </svg>
  );
}

// Medidor de estancia
function GaugeMeter({ valor, max = 240 }) {
  const pct = Math.min(valor / max, 1);
  const angle = -135 + pct * 270;
  const r = 50, cx = 60, cy = 65;
  const toXY = (deg) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });
  const start = toXY(-135);
  const end = toXY(-135 + 270);
  const color = pct < 0.4 ? "#48bb78" : pct < 0.7 ? "#ecc94b" : "#e53e3e";

  return (
    <svg viewBox="0 0 120 90" className="dash-gauge">
      <path
        d={`M${start.x},${start.y} A${r},${r} 0 1 1 ${end.x},${end.y}`}
        fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round"
      />
      <path
        d={`M${start.x},${start.y} A${r},${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${toXY(-135 + pct * 270).x},${toXY(-135 + pct * 270).y}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="bold" fill={color}>{valor}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#94a3b8">min promedio</text>
    </svg>
  );
}

// Panel de alertas
function AlertasPanel({ alertas }) {
  const prioridadTexto = (p) => {
    if (p === 1) return "🔴 ALERTA";
    if (p === 2) return "🟠 AVISO";
    return "🔵 INFO";
  };

  if (!alertas?.length) return <p className="dash-empty">Sin alertas recientes</p>;

  return (
    <ul className="dash-alertas-list">
      {alertas.map((a) => (
        <li key={a.caso_id} className={`dash-alerta-item p${a.prioridad || 3}`}>
          <span className="dash-alerta-tag">{prioridadTexto(a.prioridad)}</span>
          <span className="dash-alerta-text">
            {a.nombre} – {a.estado}
          </span>
          <span className="dash-alerta-hora">
            {new Date(a.fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── componente principal ───────────────────────────────────────────────────
export default function Dashboard() {
  const [hora, setHora] = useState(ahora());
  const [loading, setLoading] = useState(true);

  const [resumen, setResumen] = useState(null);
  const [flujo, setFlujo] = useState([]);
  const [triaje, setTriaje] = useState(null);
  const [camillas, setCamillas] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [alertas, setAlertas] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [rRes, rFlujo, rTriaje, rCamillas, rPersonal, rMetricas, rAlertas] = await Promise.allSettled([
        api.get("/dashboard/resumen"),
        api.get("/dashboard/flujo"),
        api.get("/dashboard/triaje"),
        api.get("/dashboard/camillas"),
        api.get("/dashboard/personal"),
        api.get("/dashboard/metricas-tiempo"),
        api.get("/dashboard/alertas"),
      ]);

      if (rRes.status === "fulfilled") setResumen(rRes.value.data);
      if (rFlujo.status === "fulfilled") setFlujo(rFlujo.value.data.flujo);
      if (rTriaje.status === "fulfilled") setTriaje(rTriaje.value.data);
      if (rCamillas.status === "fulfilled") setCamillas(rCamillas.value.data);
      if (rPersonal.status === "fulfilled") setPersonal(rPersonal.value.data);
      if (rMetricas.status === "fulfilled") setMetricas(rMetricas.value.data);
      if (rAlertas.status === "fulfilled") setAlertas(rAlertas.value.data);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const dataInterval = setInterval(fetchAll, 10000); // refresca cada 10s
    const clockInterval = setInterval(() => setHora(ahora()), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, [fetchAll]);

  return (
    <div className="dash-root">
      {/* ── ENCABEZADO ── */}
      <header className="dash-header">
        <div className="dash-header-left">
          <img src="/Logo.jpeg" alt="Logo" className="dash-logo" />
          <div>
            <h1 className="dash-title">Sistema de Emergencias</h1>
            <p className="dash-subtitle">Monitor en tiempo real</p>
          </div>
        </div>
        <div className="dash-header-right">
          <span className="dash-badge">● EN VIVO</span>
          <span className="dash-clock">Actualizado: {hora}</span>
        </div>
      </header>

      {/* ── KPIs GLOBALES ── */}
      <section className="dash-kpi-row">
        <KpiCard
          label="Pacientes Totales"
          value={resumen?.total_pacientes ?? "–"}
          color="#f1f5f9"
        />
        <KpiCard
          label="En Espera Críticos (I/II)"
          value={resumen?.en_espera_criticos ?? "–"}
          color="#e53e3e"
        />
        <KpiCard
          label="Camillas Disponibles"
          value={camillas?.libres ?? "–"}
          color={camillas?.libres === 0 ? "#e53e3e" : "#48bb78"}
          sub={camillas ? `${camillas.ocupadas} ocupadas / ${camillas.total} total` : ""}
        />
        <KpiCard
          label="Tiempo Promedio Espera"
          value={resumen?.tiempo_promedio_espera_min ?? "–"}
          unit="min"
          color="#ecc94b"
        />
      </section>

      {/* ── GRID PRINCIPAL ── */}
      <div className="dash-grid">

        {/* Flujo de pacientes */}
        <SectionCard title="Flujo de Pacientes" loading={loading}>
          <FlujoBarra flujo={flujo} />
        </SectionCard>

        {/* Pacientes por triaje */}
        <SectionCard title="Pacientes por Triaje" loading={loading}>
          <TriajeChart porNivel={triaje?.por_nivel} totalActivos={triaje?.total_activos ?? 0} />
        </SectionCard>

        {/* Gestión de camillas */}
        <SectionCard title="Gestión de Camillas" loading={loading}>
          <div className="dash-camillas-leyenda">
            <span className="dash-camilla libre sm" /> Libre
            <span className="dash-camilla ocupada sm" /> Ocupada
          </div>
          <CamillasMapa camillas={camillas?.camillas} />
        </SectionCard>

        {/* Recursos y personal */}
        <SectionCard title="Personal por Especialidad" loading={loading}>
          <p className="dash-personal-activos">
            <strong>{personal?.doctores_activos ?? "–"}</strong> doctores en atención ahora
          </p>
          <ul className="dash-personal-list">
            {(personal?.por_especialidad || []).map((e, i) => (
              <li key={i}>
                <span className="dash-personal-nombre">{e.especialidad}</span>
                <div className="dash-personal-bar-wrap">
                  <div
                    className="dash-personal-bar"
                    style={{ width: `${Math.min((e.total / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="dash-personal-total">{e.total}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Métricas de tiempo */}
        <SectionCard title="Evolución Tiempo de Espera (24h)" loading={loading}>
          <LineChart datos={metricas?.evolucion_espera} />
        </SectionCard>

        {/* Estancia promedio */}
        <SectionCard title="Tiempo Total de Estancia" loading={loading}>
          <GaugeMeter valor={metricas?.promedio_estancia_min ?? 0} />
          <p className="dash-gauge-label">Promedio en minutos (casos con alta)</p>
        </SectionCard>

        {/* Alertas */}
        <SectionCard title="Alertas y Eventos (Última Hora)" loading={loading} className="dash-full">
          <AlertasPanel alertas={alertas?.recientes} />
        </SectionCard>

      </div>
    </div>
  );
}
