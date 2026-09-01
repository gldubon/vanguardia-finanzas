import React, { useState, useEffect, useMemo } from "react";

const DEFAULT_CATS = [
  { id: "vivienda", name: "Vivienda", icon: "🏠", budget: 7000 },
  { id: "mercado", name: "Mercado", icon: "🧺", budget: 3000 },
  { id: "transporte", name: "Transporte", icon: "🚗", budget: 1500 },
  { id: "servicios", name: "Servicios", icon: "💡", budget: 1200 },
  { id: "educacion", name: "Educación", icon: "🎓", budget: 1000 },
  { id: "salud", name: "Salud", icon: "🩺", budget: 800 },
  { id: "entretenimiento", name: "Entretenimiento", icon: "🎬", budget: 600 },
  { id: "otros", name: "Otros", icon: "📦", budget: 500 },
];

const LS_KEYS = {
  tx: "vg_transacciones",
  cats: "vg_categorias",
  goal: "vg_meta",
  onboarded: "vg_onboarded",
  name: "vg_nombre",
};

const fmt = (n) =>
  "L " + Math.round(n || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 });

const uid = () => Math.random().toString(36).slice(2, 10);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable, ignore silently
  }
}

const colors = {
  bg: "#0b1220",
  bgGrad: "radial-gradient(circle at 20% 0%, #16213a 0%, #0b1220 55%, #070b14 100%)",
  card: "#121b2e",
  cardBorder: "rgba(212,175,55,0.14)",
  gold: "#d9b45b",
  goldSoft: "#e7c877",
  text: "#eef1f8",
  textDim: "#93a0bd",
  danger: "#f0665f",
};

export default function App() {
  const [onboarded, setOnboarded] = useState(() => load(LS_KEYS.onboarded, false));
  const [name, setName] = useState(() => load(LS_KEYS.name, ""));
  const [tx, setTx] = useState(() => load(LS_KEYS.tx, []));
  const [cats, setCats] = useState(() => load(LS_KEYS.cats, DEFAULT_CATS));
  const [goal, setGoal] = useState(() => load(LS_KEYS.goal, { target: 0, saved: 0, label: "" }));
  const [tab, setTab] = useState("inicio");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ cat: DEFAULT_CATS[0].id, amount: "", note: "" });
  const [error, setError] = useState("");

  useEffect(() => persist(LS_KEYS.tx, tx), [tx]);
  useEffect(() => persist(LS_KEYS.cats, cats), [cats]);
  useEffect(() => persist(LS_KEYS.goal, goal), [goal]);
  useEffect(() => persist(LS_KEYS.onboarded, onboarded), [onboarded]);
  useEffect(() => persist(LS_KEYS.name, name), [name]);

  const totals = useMemo(() => {
    const byCat = {};
    let total = 0;
    for (const c of cats) byCat[c.id] = 0;
    for (const t of tx) {
      byCat[t.cat] = (byCat[t.cat] || 0) + t.amount;
      total += t.amount;
    }
    return { byCat, total };
  }, [tx, cats]);

  const totalBudget = cats.reduce((s, c) => s + Number(c.budget || 0), 0);
  const restante = totalBudget - totals.total;

  const submitTx = () => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    setTx([{ id: uid(), cat: form.cat, amount: amt, note: form.note, date: Date.now() }, ...tx]);
    setForm({ cat: cats[0].id, amount: "", note: "" });
    setError("");
    setShowAdd(false);
  };

  const resetData = () => {
    if (!confirm("Esto borrará todos tus movimientos guardados en este teléfono. ¿Continuar?")) return;
    setTx([]);
  };

  const exportCsv = () => {
    const rows = [["Fecha", "Categoría", "Monto", "Nota"]];
    for (const t of tx) {
      const cat = cats.find((c) => c.id === t.cat);
      rows.push([new Date(t.date).toLocaleDateString("es-HN"), cat?.name || t.cat, t.amount, t.note || ""]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vanguardia-movimientos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!onboarded) {
    return <Onboarding name={name} setName={setName} onDone={() => setOnboarded(true)} />;
  }

  return (
    <div style={styles.page}>
      <GlobalStyle />
      <div style={styles.shell}>
        {tab === "inicio" && (
          <Inicio
            name={name}
            cats={cats}
            totals={totals}
            totalBudget={totalBudget}
            restante={restante}
          />
        )}
        {tab === "metas" && <Metas goal={goal} setGoal={setGoal} />}
        {tab === "reportes" && <Reportes tx={tx} cats={cats} onExport={exportCsv} />}
        {tab === "perfil" && (
          <Perfil name={name} setName={setName} onReset={resetData} onExport={exportCsv} />
        )}

        <BottomNav tab={tab} setTab={setTab} />

        <button
          className="fab"
          onClick={() => setShowAdd(true)}
          aria-label="Registrar gasto"
          style={styles.fab}
        >
          +
        </button>

        {showAdd && (
          <AddModal
            cats={cats}
            form={form}
            setForm={setForm}
            error={error}
            onCancel={() => {
              setShowAdd(false);
              setError("");
            }}
            onSave={submitTx}
          />
        )}
      </div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      html, body { margin:0; padding:0; background:${colors.bg}; }
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      h1,h2,.brand { font-family: 'Sora', sans-serif; }
      button { cursor: pointer; }
      .fab:active { transform: scale(0.94); }
      .cat-row:active { transform: scale(0.98); }
      input, select { font-family: inherit; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(217,180,91,0.3); border-radius: 4px; }
    `}</style>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.bgGrad,
    display: "flex",
    justifyContent: "center",
    color: colors.text,
  },
  shell: {
    width: "100%",
    maxWidth: 480,
    minHeight: "100vh",
    position: "relative",
    padding: "28px 18px 100px",
  },
  fab: {
    position: "fixed",
    right: "calc(50% - 240px + 20px)",
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldSoft})`,
    color: "#1a1305",
    fontSize: 28,
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(217,180,91,0.35)",
  },
};

function Onboarding({ name, setName, onDone }) {
  const [step, setStep] = useState(0);
  return (
    <div style={{ ...styles.page, alignItems: "center" }}>
      <GlobalStyle />
      <div style={{ maxWidth: 420, padding: "40px 24px", textAlign: "center" }}>
        {step === 0 && (
          <>
            <div className="brand" style={{ fontSize: 30, fontWeight: 700, color: colors.gold }}>
              Vanguardia
            </div>
            <div style={{ fontSize: 16, color: colors.textDim, marginTop: 8 }}>
              Mis Finanzas Personales
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: colors.text, marginTop: 28 }}>
              No necesitas saber de contabilidad para ordenar tu dinero. Aquí registras
              lo que gastas en segundos, y la app te muestra al instante cuánto te
              queda disponible este mes.
            </p>
            <p style={{ fontSize: 13, color: colors.textDim, marginTop: 16 }}>
              Tus datos se guardan solo en este teléfono. Nadie más los ve.
            </p>
            <button style={btnPrimary} onClick={() => setStep(1)}>
              Empezar
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 20 }}>
              ¿Cómo te llamas?
            </div>
            <p style={{ fontSize: 13, color: colors.textDim, marginTop: 8 }}>
              Solo para saludarte, no se comparte con nadie.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...inputStyle, marginTop: 20, textAlign: "center", fontSize: 16 }}
            />
            <button style={btnPrimary} onClick={onDone}>
              Ir a mis finanzas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Inicio({ name, cats, totals, totalBudget, restante }) {
  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, letterSpacing: 0.3, color: colors.textDim, fontWeight: 500 }}>
          {name ? `Hola, ${name}` : "Hola"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>Tu mes en un vistazo</div>
      </div>

      <div
        style={{
          borderRadius: 22,
          padding: "18px 20px",
          background: "linear-gradient(135deg, rgba(217,180,91,0.16), rgba(217,180,91,0.05))",
          border: `1px solid ${colors.cardBorder}`,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 6 }}>
          Te queda disponible
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: restante < 0 ? colors.danger : colors.text }}>
          {fmt(Math.max(restante, restante < 0 ? restante : 0))}
        </div>
        <div style={{ fontSize: 12, color: colors.textDim, marginTop: 6 }}>
          de {fmt(totalBudget)} presupuestados este mes
        </div>
        <div style={{ marginTop: 12, height: 6, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${totalBudget ? Math.min(100, (totals.total / totalBudget) * 100) : 0}%`,
              background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldSoft})`,
              borderRadius: 6,
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: colors.textDim, marginBottom: 10 }}>
        Distribución del gasto
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cats.map((c) => {
          const spent = totals.byCat[c.id] || 0;
          const budget = Number(c.budget || 0);
          const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
          return (
            <div key={c.id} className="cat-row">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span>{c.icon} {c.name}</span>
                <span style={{ color: colors.textDim }}>{fmt(spent)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 6,
                    background: pct >= 100 ? `linear-gradient(90deg, ${colors.danger}, #d9455a)` : `linear-gradient(90deg, ${colors.gold}, ${colors.goldSoft})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Metas({ goal, setGoal }) {
  const [local, setLocal] = useState(goal);
  useEffect(() => setLocal(goal), [goal]);
  const pct = local.target ? Math.min(100, (local.saved / local.target) * 100) : 0;
  return (
    <>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Tu meta de ahorro</div>
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <label style={labelStyle}>¿Para qué estás ahorrando?</label>
        <input
          type="text"
          placeholder="Ej: fondo de emergencia"
          value={local.label}
          onChange={(e) => setLocal({ ...local, label: e.target.value })}
          style={inputStyle}
        />
        <label style={{ ...labelStyle, marginTop: 12 }}>Meta total (Lempiras)</label>
        <input
          type="number"
          placeholder="0"
          value={local.target || ""}
          onChange={(e) => setLocal({ ...local, target: parseFloat(e.target.value) || 0 })}
          style={inputStyle}
        />
        <label style={{ ...labelStyle, marginTop: 12 }}>Cuánto llevas ahorrado</label>
        <input
          type="number"
          placeholder="0"
          value={local.saved || ""}
          onChange={(e) => setLocal({ ...local, saved: parseFloat(e.target.value) || 0 })}
          style={inputStyle}
        />
        <button style={{ ...btnPrimary, marginTop: 16 }} onClick={() => setGoal(local)}>
          Guardar meta
        </button>
      </div>

      {local.target > 0 && (
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: colors.textDim, marginBottom: 6 }}>
            {local.label || "Tu meta"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {fmt(local.saved)} <span style={{ fontSize: 13, color: colors.textDim, fontWeight: 400 }}>de {fmt(local.target)}</span>
          </div>
          <div style={{ marginTop: 10, height: 8, borderRadius: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldSoft})`, borderRadius: 8 }} />
          </div>
          <div style={{ fontSize: 12, color: colors.textDim, marginTop: 8 }}>{Math.round(pct)}% completado</div>
        </div>
      )}
    </>
  );
}

function Reportes({ tx, cats, onExport }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Movimientos</div>
        <button style={btnGhost} onClick={onExport}>Exportar CSV</button>
      </div>
      {tx.length === 0 && (
        <div style={{ color: colors.textDim, fontSize: 14, textAlign: "center", marginTop: 40 }}>
          Aún no registras gastos. Usa el botón + para agregar el primero.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tx.map((t) => {
          const cat = cats.find((c) => c.id === t.cat);
          return (
            <div key={t.id} style={{ ...cardStyle, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14 }}>{cat?.icon} {cat?.name || t.cat}</div>
                {t.note && <div style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>{t.note}</div>}
                <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>
                  {new Date(t.date).toLocaleDateString("es-HN")}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(t.amount)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Perfil({ name, setName, onReset, onExport }) {
  return (
    <>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Perfil</div>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <label style={labelStyle}>Tu nombre</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 14, marginBottom: 10 }}>Descargar mis datos</div>
        <button style={btnGhost} onClick={onExport}>Exportar CSV</button>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: 14, marginBottom: 10, color: colors.danger }}>Zona de riesgo</div>
        <button style={{ ...btnGhost, borderColor: colors.danger, color: colors.danger }} onClick={onReset}>
          Borrar todos mis movimientos
        </button>
      </div>
    </>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "inicio", label: "Inicio", icon: "🏡" },
    { id: "metas", label: "Metas", icon: "🎯" },
    { id: "reportes", label: "Reportes", icon: "📊" },
    { id: "perfil", label: "Perfil", icon: "🙂" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        background: "linear-gradient(0deg, #0b1220 60%, transparent)",
        paddingTop: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          justifyContent: "space-around",
          padding: "12px 18px calc(12px + env(safe-area-inset-bottom))",
          borderTop: `1px solid ${colors.cardBorder}`,
          background: "#0d1526",
        }}
      >
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: tab === t.id ? colors.gold : colors.textDim,
              fontSize: 10,
            }}
          >
            <span style={{ fontSize: 17 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddModal({ cats, form, setForm, error, onCancel, onSave }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,7,14,0.72)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#121b2e",
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          padding: 20,
          border: `1px solid ${colors.cardBorder}`,
          paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Registrar gasto</div>

        <label style={labelStyle}>Categoría</label>
        <select value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))} style={inputStyle}>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <label style={{ ...labelStyle, marginTop: 12 }}>Monto (Lempiras)</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          style={inputStyle}
        />
        {error && <div style={{ color: colors.danger, fontSize: 12, marginTop: 6 }}>{error}</div>}

        <label style={{ ...labelStyle, marginTop: 12 }}>Nota (opcional)</label>
        <input
          type="text"
          placeholder="Ej: pupusas con la familia"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={btnGhost} onClick={onCancel}>Cancelar</button>
          <button style={{ ...btnPrimary, marginTop: 0, flex: 1 }} onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  borderRadius: 18,
  padding: "16px 18px",
  background: colors.card,
  border: `1px solid ${colors.cardBorder}`,
};
const labelStyle = { fontSize: 12, color: colors.textDim, display: "block", marginBottom: 6 };
const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  background: "#0d1526",
  color: colors.text,
  border: "1px solid rgba(255,255,255,0.12)",
  fontSize: 14,
};
const btnPrimary = {
  width: "100%",
  marginTop: 28,
  padding: "13px 0",
  borderRadius: 12,
  border: "none",
  background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldSoft})`,
  color: "#1a1305",
  fontSize: 15,
  fontWeight: 700,
};
const btnGhost = {
  flex: 1,
  padding: "12px 0",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: colors.text,
  fontSize: 14,
};
