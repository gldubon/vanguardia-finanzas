import React, { useState, useEffect, useMemo } from "react";
import {
  Home, ShoppingCart, Car, Zap, GraduationCap, HeartPulse, Film, Package,
  Briefcase, TrendingUp, Gift, Building2, HandCoins, PlusCircle, Tag, Wallet,
} from "lucide-react";

const ICONS = {
  home: Home,
  cart: ShoppingCart,
  car: Car,
  zap: Zap,
  cap: GraduationCap,
  heart: HeartPulse,
  film: Film,
  package: Package,
  briefcase: Briefcase,
  trending: TrendingUp,
  gift: Gift,
  building: Building2,
  handshake: HandCoins,
  plus: PlusCircle,
  wallet: Wallet,
  tag: Tag,
};
const ICON_KEYS = Object.keys(ICONS);

const CATEGORY_COLORS = ["#d9b45b", "#4fd1c5", "#ef8354", "#6f9ceb", "#b892ff", "#5fbf8a", "#f472b6", "#f2a65a"];
function colorForCat(cats, id) {
  const i = cats.findIndex((c) => c.id === id);
  return CATEGORY_COLORS[(i < 0 ? 0 : i) % CATEGORY_COLORS.length];
}

const DEFAULT_CATS = [
  { id: "vivienda", name: "Vivienda", icon: "home", budget: 7000 },
  { id: "mercado", name: "Mercado", icon: "cart", budget: 3000 },
  { id: "transporte", name: "Transporte", icon: "car", budget: 1500 },
  { id: "servicios", name: "Servicios", icon: "zap", budget: 1200 },
  { id: "educacion", name: "Educación", icon: "cap", budget: 1000 },
  { id: "salud", name: "Salud", icon: "heart", budget: 800 },
  { id: "entretenimiento", name: "Entretenimiento", icon: "film", budget: 600 },
  { id: "otros", name: "Otros", icon: "package", budget: 500 },
];

const DEFAULT_INCOME_CATS = [
  { id: "sueldo", name: "Sueldo", icon: "briefcase", amount: 12000 },
  { id: "comisiones", name: "Comisiones", icon: "trending", amount: 0 },
  { id: "bonos", name: "Bonos", icon: "gift", amount: 0 },
  { id: "rentas", name: "Rentas", icon: "building", amount: 0 },
  { id: "donaciones", name: "Donaciones", icon: "handshake", amount: 0 },
  { id: "otros-ingresos", name: "Otros ingresos", icon: "plus", amount: 0 },
];

const LS_KEYS = {
  tx: "vg_transacciones",
  cats: "vg_categorias",
  incomeCats: "vg_categorias_ingreso",
  goal: "vg_meta",
  onboarded: "vg_onboarded",
  name: "vg_nombre",
  budgets: "vg_presupuestos_mensuales",
  incomes: "vg_ingresos_mensuales",
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

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function monthKey(y, m) {
  return `${y}-${m}`;
}
function txMonthKey(dateMs) {
  const d = new Date(dateMs);
  return monthKey(d.getFullYear(), d.getMonth());
}
function toDateInputValue(dateMs) {
  const d = new Date(dateMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function quarterMonths(q) { return [q * 3, q * 3 + 1, q * 3 + 2]; }
function semesterMonths(s) { return s === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11]; }

function effectiveMap(cats, overrides, year, month, defaultField) {
  const key = monthKey(year, month);
  const saved = overrides[key] || {};
  const map = {};
  for (const c of cats) {
    map[c.id] = saved[c.id] !== undefined ? saved[c.id] : Number(c[defaultField] || 0);
  }
  return map;
}

const colors = {
  bg: "#0b1220",
  bgGrad: "radial-gradient(circle at 20% 0%, #16213a 0%, #0b1220 55%, #070b14 100%)",
  card: "#121b2e",
  cardBorder: "rgba(212,175,55,0.14)",
  gold: "#d9b45b",
  goldSoft: "#e7c877",
  compare: "#6f7ea8",
  text: "#eef1f8",
  textDim: "#93a0bd",
  danger: "#f0665f",
  success: "#5fbf8a",
};

// ---------- Marca ----------

function BrandMark({ size = 34 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#0d1526",
        border: `${Math.max(2, size * 0.035)}px solid ${colors.gold}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 14px rgba(217,180,91,0.25)",
      }}
    >
      <span
        style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.5,
          color: colors.gold,
          lineHeight: 1,
        }}
      >
        V
      </span>
    </div>
  );
}

function BrandHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
      <BrandMark size={34} />
      <div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: colors.gold, lineHeight: 1.2 }}>
          Vanguardia
        </div>
        <div style={{ fontSize: 11, color: colors.textDim, marginTop: 1 }}>
          Mis Finanzas Personales
        </div>
      </div>
    </div>
  );
}

function IconBadge({ iconKey, color, size = 38 }) {
  const Icon = ICONS[iconKey] || Tag;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}26`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={size * 0.52} strokeWidth={2.1} color={color} />
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 0" }}>
      {ICON_KEYS.map((k) => {
        const Icon = ICONS[k];
        const active = value === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: `1px solid ${active ? colors.gold : "rgba(255,255,255,0.12)"}`,
              background: active ? "rgba(217,180,91,0.18)" : "#0d1526",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={16} color={active ? colors.gold : colors.textDim} />
          </button>
        );
      })}
    </div>
  );
}

// ---------- App ----------

export default function App() {
  const [onboarded, setOnboarded] = useState(() => load(LS_KEYS.onboarded, false));
  const [name, setName] = useState(() => load(LS_KEYS.name, ""));
  const [tx, setTx] = useState(() => load(LS_KEYS.tx, []));
  const [cats, setCats] = useState(() => load(LS_KEYS.cats, DEFAULT_CATS));
  const [incomeCats, setIncomeCats] = useState(() => load(LS_KEYS.incomeCats, DEFAULT_INCOME_CATS));
  const [goal, setGoal] = useState(() => load(LS_KEYS.goal, { target: 0, saved: 0, label: "" }));
  const [budgets, setBudgets] = useState(() => load(LS_KEYS.budgets, {}));
  const [incomes, setIncomes] = useState(() => load(LS_KEYS.incomes, {}));
  const [tab, setTab] = useState("inicio");
  const [showAdd, setShowAdd] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [showIncomeCats, setShowIncomeCats] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showIncome, setShowIncome] = useState(false);

  const now = new Date();
  const [selMonth, setSelMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const [form, setForm] = useState({
    cat: (load(LS_KEYS.cats, DEFAULT_CATS)[0] || DEFAULT_CATS[0]).id,
    amount: "",
    note: "",
    date: toDateInputValue(Date.now()),
  });
  const [error, setError] = useState("");

  useEffect(() => persist(LS_KEYS.tx, tx), [tx]);
  useEffect(() => persist(LS_KEYS.cats, cats), [cats]);
  useEffect(() => persist(LS_KEYS.incomeCats, incomeCats), [incomeCats]);
  useEffect(() => persist(LS_KEYS.goal, goal), [goal]);
  useEffect(() => persist(LS_KEYS.budgets, budgets), [budgets]);
  useEffect(() => persist(LS_KEYS.incomes, incomes), [incomes]);
  useEffect(() => persist(LS_KEYS.onboarded, onboarded), [onboarded]);
  useEffect(() => persist(LS_KEYS.name, name), [name]);

  const txMonth = useMemo(() => {
    const key = monthKey(selMonth.year, selMonth.month);
    return tx.filter((t) => txMonthKey(t.date) === key);
  }, [tx, selMonth]);

  const totals = useMemo(() => {
    const byCat = {};
    let total = 0;
    for (const c of cats) byCat[c.id] = 0;
    for (const t of txMonth) {
      byCat[t.cat] = (byCat[t.cat] || 0) + t.amount;
      total += t.amount;
    }
    return { byCat, total };
  }, [txMonth, cats]);

  const monthBudgetMap = useMemo(
    () => effectiveMap(cats, budgets, selMonth.year, selMonth.month, "budget"),
    [cats, budgets, selMonth]
  );
  const monthIncomeMap = useMemo(
    () => effectiveMap(incomeCats, incomes, selMonth.year, selMonth.month, "amount"),
    [incomeCats, incomes, selMonth]
  );

  const totalBudget = Object.values(monthBudgetMap).reduce((s, v) => s + v, 0);
  const totalIncome = Object.values(monthIncomeMap).reduce((s, v) => s + v, 0);
  const restante = totalBudget - totals.total;

  const openAdd = () => {
    const isCurrent = selMonth.year === now.getFullYear() && selMonth.month === now.getMonth();
    const defaultDate = isCurrent ? Date.now() : new Date(selMonth.year, selMonth.month, 1).getTime();
    setForm({ cat: cats[0]?.id || "", amount: "", note: "", date: toDateInputValue(defaultDate) });
    setError("");
    setShowAdd(true);
  };

  const submitTx = () => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    if (!form.cat) {
      setError("Elige una categoría");
      return;
    }
    const ts = new Date(form.date + "T12:00:00").getTime();
    setTx([{ id: uid(), cat: form.cat, amount: amt, note: form.note, date: ts }, ...tx]);
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

  const catHasTx = (id) => tx.some((t) => t.cat === id);

  const saveBudgetMonth = (draftMap) => {
    const key = monthKey(selMonth.year, selMonth.month);
    setBudgets({ ...budgets, [key]: draftMap });
  };
  const saveIncomeMonth = (draftMap) => {
    const key = monthKey(selMonth.year, selMonth.month);
    setIncomes({ ...incomes, [key]: draftMap });
  };

  if (!onboarded) {
    return <Onboarding name={name} setName={setName} onDone={() => setOnboarded(true)} />;
  }

  return (
    <div style={styles.page}>
      <GlobalStyle />
      <div style={styles.shell}>
        <BrandHeader />

        {tab === "inicio" && (
          <Inicio
            name={name}
            cats={cats}
            totals={totals}
            totalBudget={totalBudget}
            totalIncome={totalIncome}
            restante={restante}
            selMonth={selMonth}
            setSelMonth={setSelMonth}
            monthBudgetMap={monthBudgetMap}
            onEditBudget={() => setShowBudget(true)}
            onEditIncome={() => setShowIncome(true)}
          />
        )}
        {tab === "metas" && <Metas goal={goal} setGoal={setGoal} />}
        {tab === "reportes" && <Reportes tx={tx} cats={cats} onExport={exportCsv} />}
        {tab === "perfil" && (
          <Perfil
            name={name}
            setName={setName}
            onReset={resetData}
            onExport={exportCsv}
            onManageCats={() => setShowCats(true)}
            onManageIncomeCats={() => setShowIncomeCats(true)}
          />
        )}

        <BottomNav tab={tab} setTab={setTab} />

        <button className="fab" onClick={openAdd} aria-label="Registrar gasto" style={styles.fab}>
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

        {showCats && (
          <CategoriasModal
            title="Categorías de gasto"
            hint="El presupuesto total del mes es la suma de los presupuestos por defecto de cada categoría. Puedes ajustarlo mes a mes desde Inicio."
            amountLabel="Presupuesto por defecto"
            cats={cats}
            amountField="budget"
            catHasTx={catHasTx}
            onSave={setCats}
            onClose={() => setShowCats(false)}
          />
        )}

        {showIncomeCats && (
          <CategoriasModal
            title="Categorías de ingreso"
            hint="El ingreso estimado del mes es la suma de estos montos por defecto. Puedes ajustarlo mes a mes desde Inicio."
            amountLabel="Estimado por defecto"
            cats={incomeCats}
            amountField="amount"
            catHasTx={() => false}
            onSave={setIncomeCats}
            onClose={() => setShowIncomeCats(false)}
          />
        )}

        {showBudget && (
          <MonthAmountModal
            title={`Presupuesto de ${MONTHS_ES[selMonth.month]} ${selMonth.year}`}
            cats={cats}
            currentMap={monthBudgetMap}
            onSave={saveBudgetMonth}
            onClose={() => setShowBudget(false)}
            accent={colors.gold}
          />
        )}

        {showIncome && (
          <MonthAmountModal
            title={`Ingresos de ${MONTHS_ES[selMonth.month]} ${selMonth.year}`}
            cats={incomeCats}
            currentMap={monthIncomeMap}
            onSave={saveIncomeMonth}
            onClose={() => setShowIncome(false)}
            accent={colors.success}
          />
        )}
      </div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
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
    padding: "24px 18px 100px",
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
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <BrandMark size={72} />
            </div>
            <div className="brand" style={{ fontSize: 32, fontWeight: 800, color: colors.gold, letterSpacing: 0.5 }}>
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

function MonthNav({ selMonth, setSelMonth }) {
  const go = (delta) => {
    let { year, month } = selMonth;
    month += delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    setSelMonth({ year, month });
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <button onClick={() => go(-1)} aria-label="Mes anterior" style={monthBtn}>‹</button>
      <div style={{ fontSize: 16, fontWeight: 700 }}>
        {MONTHS_ES[selMonth.month]} {selMonth.year}
      </div>
      <button onClick={() => go(1)} aria-label="Mes siguiente" style={monthBtn}>›</button>
    </div>
  );
}

const monthBtn = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: `1px solid ${colors.cardBorder}`,
  background: colors.card,
  color: colors.gold,
  fontSize: 18,
  lineHeight: 1,
};

function Inicio({ name, cats, totals, totalBudget, totalIncome, restante, selMonth, setSelMonth, monthBudgetMap, onEditBudget, onEditIncome }) {
  const overBudget = totalIncome > 0 && totalBudget > totalIncome;
  return (
    <>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 13, letterSpacing: 0.3, color: colors.textDim, fontWeight: 500 }}>
          {name ? `Hola, ${name}` : "Hola"}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>Tu mes en un vistazo</div>
      </div>

      <MonthNav selMonth={selMonth} setSelMonth={setSelMonth} />

      <div
        style={{
          borderRadius: 18,
          padding: "14px 18px",
          background: "rgba(95,191,138,0.08)",
          border: `1px solid rgba(95,191,138,0.25)`,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: colors.textDim }}>Ingresos estimados</div>
          <div style={{ fontSize: 21, fontWeight: 700, color: colors.success }}>{fmt(totalIncome)}</div>
        </div>
        <button onClick={onEditIncome} style={smallLinkBtn(colors.success)}>Editar ingresos</button>
      </div>

      <div
        style={{
          borderRadius: 22,
          padding: "20px 22px",
          background: "linear-gradient(135deg, rgba(217,180,91,0.16), rgba(217,180,91,0.05))",
          border: `1px solid ${colors.cardBorder}`,
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 13, color: colors.textDim, marginBottom: 6 }}>
          Te queda disponible
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: restante < 0 ? colors.danger : colors.text, letterSpacing: -0.5 }}>
          {fmt(restante)}
        </div>
        <div style={{ fontSize: 13, color: colors.textDim, marginTop: 6 }}>
          de {fmt(totalBudget)} presupuestados este mes
        </div>
        <div style={{ marginTop: 12, height: 7, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${totalBudget ? Math.min(100, (totals.total / totalBudget) * 100) : 0}%`,
              background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldSoft})`,
              borderRadius: 7,
            }}
          />
        </div>
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button onClick={onEditBudget} style={smallLinkBtn(colors.gold)}>Ajustar presupuesto</button>
        </div>
      </div>

      {overBudget && (
        <div style={{ fontSize: 12, color: colors.danger, marginBottom: 16 }}>
          Tu presupuesto de este mes ({fmt(totalBudget)}) es mayor que tus ingresos estimados ({fmt(totalIncome)}).
        </div>
      )}

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textDim, marginTop: 22, marginBottom: 12 }}>
        Distribución del gasto
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cats.map((c) => {
          const spent = totals.byCat[c.id] || 0;
          const budget = Number(monthBudgetMap[c.id] || 0);
          const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
          const color = colorForCat(cats, c.id);
          return (
            <div key={c.id} className="cat-row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconBadge iconKey={c.icon} color={color} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 5, fontWeight: 500 }}>
                  <span>{c.name}</span>
                  <span style={{ color: colors.textDim, fontSize: 13 }}>{fmt(spent)} <span style={{ opacity: 0.6 }}>/ {fmt(budget)}</span></span>
                </div>
                <div style={{ height: 7, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 7,
                      background: pct >= 100 ? `linear-gradient(90deg, ${colors.danger}, #d9455a)` : color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function smallLinkBtn(color) {
  return {
    background: "none",
    border: "none",
    color,
    fontSize: 12,
    fontWeight: 600,
    padding: 0,
  };
}

function Metas({ goal, setGoal }) {
  const [local, setLocal] = useState(goal);
  useEffect(() => setLocal(goal), [goal]);
  const pct = local.target ? Math.min(100, (local.saved / local.target) * 100) : 0;
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Tu meta de ahorro</div>
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
          <div style={{ fontSize: 24, fontWeight: 800 }}>
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

// ---------- Reportes: Lista + Comparar, por mes / trimestre / semestre / año ----------

function yearsAvailable(tx) {
  const now = new Date().getFullYear();
  const set = new Set([now, now - 1, now - 2]);
  for (const t of tx) set.add(new Date(t.date).getFullYear());
  return Array.from(set).sort((a, b) => a - b);
}

function monthsForKind(kind, idx) {
  if (kind === "mes") return [idx];
  if (kind === "trimestre") return quarterMonths(idx);
  if (kind === "semestre") return semesterMonths(idx);
  return Array.from({ length: 12 }, (_, i) => i);
}

function idxOptionsForKind(kind) {
  if (kind === "mes") return MONTHS_ES.map((m, i) => ({ value: i, label: m }));
  if (kind === "trimestre") return [0, 1, 2, 3].map((i) => ({ value: i, label: `Trimestre ${i + 1}` }));
  if (kind === "semestre") return [0, 1].map((i) => ({ value: i, label: `Semestre ${i + 1}` }));
  return [{ value: 0, label: "Año completo" }];
}

function sumPeriod(tx, cats, year, months) {
  const byCat = {};
  let total = 0;
  for (const c of cats) byCat[c.id] = 0;
  const items = [];
  for (const t of tx) {
    const d = new Date(t.date);
    if (d.getFullYear() === year && months.includes(d.getMonth())) {
      byCat[t.cat] = (byCat[t.cat] || 0) + t.amount;
      total += t.amount;
      items.push(t);
    }
  }
  return { byCat, total, items };
}

function Reportes({ tx, cats, onExport }) {
  const now = new Date();
  const [kind, setKind] = useState("mes");
  const [viewMode, setViewMode] = useState("lista");
  const [sel, setSel] = useState({ year: now.getFullYear(), idx: now.getMonth() });
  const [selA, setSelA] = useState({ year: now.getFullYear(), idx: now.getMonth() });
  const [selB, setSelB] = useState({ year: now.getFullYear() - 1, idx: now.getMonth() });

  const years = useMemo(() => yearsAvailable(tx), [tx]);
  const idxOptions = useMemo(() => idxOptionsForKind(kind), [kind]);

  const changeKind = (k) => {
    setKind(k);
    setSel((s) => ({ ...s, idx: 0 }));
    setSelA((s) => ({ ...s, idx: 0 }));
    setSelB((s) => ({ ...s, idx: 0 }));
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Reportes</div>
        <button style={btnGhost} onClick={onExport}>Exportar CSV</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 14, marginBottom: 10 }}>
        {[
          { id: "mes", label: "Mes" },
          { id: "trimestre", label: "Trimestre" },
          { id: "semestre", label: "Semestre" },
          { id: "anio", label: "Año" },
        ].map((k) => (
          <button
            key={k.id}
            onClick={() => changeKind(k.id)}
            style={{
              flex: 1,
              padding: "8px 0",
              fontSize: 11,
              borderRadius: 10,
              border: `1px solid ${kind === k.id ? colors.gold : colors.cardBorder}`,
              background: kind === k.id ? "rgba(217,180,91,0.14)" : colors.card,
              color: kind === k.id ? colors.gold : colors.textDim,
              fontWeight: 600,
            }}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[
          { id: "lista", label: "Lista" },
          { id: "comparar", label: "Comparar" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setViewMode(v.id)}
            style={{
              flex: 1,
              padding: "6px 0",
              fontSize: 11,
              borderRadius: 8,
              border: "none",
              background: viewMode === v.id ? colors.card : "transparent",
              color: viewMode === v.id ? colors.text : colors.textDim,
              fontWeight: 500,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {viewMode === "lista" ? (
        <ReportesLista tx={tx} cats={cats} kind={kind} sel={sel} setSel={setSel} years={years} idxOptions={idxOptions} />
      ) : (
        <ReportesComparar tx={tx} cats={cats} kind={kind} selA={selA} setSelA={setSelA} selB={selB} setSelB={setSelB} years={years} idxOptions={idxOptions} />
      )}
    </>
  );
}

function PeriodSelect({ year, idx, setYear, setIdx, years, idxOptions, kind }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={selectStyle}>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      {kind !== "anio" && (
        <select value={idx} onChange={(e) => setIdx(parseInt(e.target.value))} style={{ ...selectStyle, flex: 1 }}>
          {idxOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
}

function ReportesLista({ tx, cats, kind, sel, setSel, years, idxOptions }) {
  const months = monthsForKind(kind, sel.idx);
  const { total, items } = sumPeriod(tx, cats, sel.year, months);
  const catOf = (id) => cats.find((c) => c.id === id);

  const grouped = useMemo(() => {
    if (kind === "mes") return null;
    const byMonth = {};
    for (const t of items) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!byMonth[key]) byMonth[key] = { year: d.getFullYear(), month: d.getMonth(), items: [], total: 0 };
      byMonth[key].items.push(t);
      byMonth[key].total += t.amount;
    }
    return Object.values(byMonth).sort((a, b) => (b.year - a.year) || (b.month - a.month));
  }, [items, kind]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => b.date - a.date), [items]);

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <PeriodSelect
          year={sel.year} idx={sel.idx}
          setYear={(y) => setSel({ ...sel, year: y })}
          setIdx={(i) => setSel({ ...sel, idx: i })}
          years={years} idxOptions={idxOptions} kind={kind}
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: colors.textDim }}>Total del periodo</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{fmt(total)}</div>
        </div>
        <div style={{ fontSize: 12, color: colors.textDim, textAlign: "right" }}>{items.length} movimientos</div>
      </div>

      {items.length === 0 && (
        <div style={{ color: colors.textDim, fontSize: 14, textAlign: "center", marginTop: 20 }}>
          No hay gastos registrados en este periodo.
        </div>
      )}

      {kind === "mes" ? (
        <TxList items={sortedItems} cats={cats} catOf={catOf} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {grouped.map((g) => (
            <div key={`${g.year}-${g.month}`}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: colors.gold, fontWeight: 700 }}>
                <span>{MONTHS_ES[g.month]} {g.year}</span>
                <span>{fmt(g.total)}</span>
              </div>
              <TxList items={[...g.items].sort((a, b) => b.date - a.date)} cats={cats} catOf={catOf} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TxList({ items, cats, catOf }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((t) => {
        const c = catOf(t.cat);
        const color = colorForCat(cats, t.cat);
        return (
          <div key={t.id} style={{ ...cardStyle, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <IconBadge iconKey={c?.icon} color={color} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{c?.name || t.cat}</div>
              <div style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>
                {t.note ? `${t.note} · ` : ""}{new Date(t.date).toLocaleDateString("es-HN")}
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(t.amount)}</div>
          </div>
        );
      })}
    </div>
  );
}

function ReportesComparar({ tx, cats, kind, selA, setSelA, selB, setSelB, years, idxOptions }) {
  const monthsA = monthsForKind(kind, selA.idx);
  const monthsB = monthsForKind(kind, selB.idx);
  const dataA = sumPeriod(tx, cats, selA.year, monthsA);
  const dataB = sumPeriod(tx, cats, selB.year, monthsB);

  const delta = dataA.total - dataB.total;
  const deltaPct = dataB.total ? (delta / dataB.total) * 100 : 0;
  const maxVal = Math.max(1, ...cats.map((c) => Math.max(dataA.byCat[c.id] || 0, dataB.byCat[c.id] || 0)));

  const labelFor = (year, idx) => {
    if (kind === "mes") return `${MONTHS_ES[idx]} ${year}`;
    if (kind === "trimestre") return `Trimestre ${idx + 1} ${year}`;
    if (kind === "semestre") return `Semestre ${idx + 1} ${year}`;
    return `${year}`;
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, ...cardStyle, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: colors.gold, fontWeight: 600, marginBottom: 8 }}>Periodo A</div>
          <PeriodSelect
            year={selA.year} idx={selA.idx}
            setYear={(y) => setSelA({ ...selA, year: y })}
            setIdx={(i) => setSelA({ ...selA, idx: i })}
            years={years} idxOptions={idxOptions} kind={kind}
          />
        </div>
        <div style={{ flex: 1, ...cardStyle, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: colors.compare, fontWeight: 600, marginBottom: 8 }}>Periodo B</div>
          <PeriodSelect
            year={selB.year} idx={selB.idx}
            setYear={(y) => setSelB({ ...selB, year: y })}
            setIdx={(i) => setSelB({ ...selB, idx: i })}
            years={years} idxOptions={idxOptions} kind={kind}
          />
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: colors.gold }}>{labelFor(selA.year, selA.idx)}</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{fmt(dataA.total)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: colors.compare }}>{labelFor(selB.year, selB.idx)}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: colors.textDim }}>{fmt(dataB.total)}</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${colors.cardBorder}`,
            fontSize: 13,
            color: delta <= 0 ? colors.success : colors.danger,
            fontWeight: 700,
          }}
        >
          {delta === 0
            ? "Sin diferencia entre los dos periodos"
            : `${delta > 0 ? "+" : ""}${fmt(delta)} (${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(1)}%) vs periodo B`}
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textDim, marginBottom: 12 }}>
        Comparación por categoría
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cats.map((c) => {
          const va = dataA.byCat[c.id] || 0;
          const vb = dataB.byCat[c.id] || 0;
          const color = colorForCat(cats, c.id);
          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconBadge iconKey={c.icon} color={color} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, marginBottom: 5, fontWeight: 500 }}>{c.name}</div>
                <BarRow value={va} max={maxVal} color={colors.gold} label={fmt(va)} />
                <BarRow value={vb} max={maxVal} color={colors.compare} label={fmt(vb)} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 20, fontSize: 12, color: colors.textDim }}>
        <span><Dot color={colors.gold} /> Periodo A</span>
        <span><Dot color={colors.compare} /> Periodo B</span>
      </div>
    </>
  );
}

function Dot({ color }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, marginRight: 5 }} />;
}

function BarRow({ value, max, color, label }) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <div style={{ flex: 1, height: 10, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6 }} />
      </div>
      <div style={{ width: 74, fontSize: 12, color: colors.textDim, textAlign: "right" }}>{label}</div>
    </div>
  );
}

// ---------- fin Reportes ----------

function Perfil({ name, setName, onReset, onExport, onManageCats, onManageIncomeCats }) {
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Perfil</div>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <label style={labelStyle}>Tu nombre</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 14, marginBottom: 10 }}>Categorías de gasto y presupuesto</div>
        <button style={btnGhost} onClick={onManageCats}>Gestionar categorías de gasto</button>
      </div>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 14, marginBottom: 10 }}>Categorías de ingreso</div>
        <button style={btnGhost} onClick={onManageIncomeCats}>Gestionar categorías de ingreso</button>
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
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "metas", label: "Metas", icon: Gift },
    { id: "reportes", label: "Reportes", icon: TrendingUp },
    { id: "perfil", label: "Perfil", icon: Wallet },
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
        {items.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                color: active ? colors.gold : colors.textDim,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              {t.label}
            </button>
          );
        })}
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
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Registrar gasto</div>

        <label style={labelStyle}>Categoría</label>
        <select value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))} style={inputStyle}>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label style={{ ...labelStyle, marginTop: 12 }}>Fecha</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          style={inputStyle}
        />

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

function CategoriasModal({ title, hint, amountLabel, cats, amountField, catHasTx, onSave, onClose }) {
  const [draft, setDraft] = useState(cats.map((c) => ({ ...c })));
  const [newCat, setNewCat] = useState({ icon: "tag", name: "", amount: "" });
  const [openIconFor, setOpenIconFor] = useState(null);
  const [newIconOpen, setNewIconOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const updateField = (id, field, value) => {
    setDraft((d) => d.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeCat = (id) => {
    if (catHasTx(id)) {
      setMsg("No puedes eliminar una categoría con movimientos ya registrados.");
      return;
    }
    setDraft((d) => d.filter((c) => c.id !== id));
    setMsg("");
  };

  const addCat = () => {
    if (!newCat.name.trim()) {
      setMsg("Ponle un nombre a la nueva categoría");
      return;
    }
    const id = newCat.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + uid().slice(0, 4);
    setDraft((d) => [...d, { id, name: newCat.name.trim(), icon: newCat.icon || "tag", [amountField]: parseFloat(newCat.amount) || 0 }]);
    setNewCat({ icon: "tag", name: "", amount: "" });
    setNewIconOpen(false);
    setMsg("");
  };

  const save = () => {
    onSave(draft);
    onClose();
  };

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
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 14 }}>{hint}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {draft.map((c) => {
            const color = colorForCat(draft, c.id);
            const Icon = ICONS[c.icon] || Tag;
            return (
              <div key={c.id}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setOpenIconFor(openIconFor === c.id ? null : c.id)}
                    style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      border: `1px solid ${colors.cardBorder}`, background: `${color}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color={color} />
                  </button>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateField(c.id, "name", e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="number"
                    value={c[amountField]}
                    onChange={(e) => updateField(c.id, amountField, parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, width: 90 }}
                  />
                  <button
                    onClick={() => removeCat(c.id)}
                    aria-label={`Eliminar ${c.name}`}
                    style={{ background: "none", border: "none", color: colors.danger, fontSize: 18, padding: "6px 4px" }}
                  >
                    ×
                  </button>
                </div>
                {openIconFor === c.id && (
                  <IconPicker value={c.icon} onChange={(k) => updateField(c.id, "icon", k)} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${colors.cardBorder}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.textDim, marginBottom: 8 }}>
            Agregar categoría · {amountLabel}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(() => {
              const NewIcon = ICONS[newCat.icon] || Tag;
              return (
                <button
                  onClick={() => setNewIconOpen((v) => !v)}
                  style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    border: `1px solid ${colors.cardBorder}`, background: "#0d1526",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <NewIcon size={18} color={colors.gold} />
                </button>
              );
            })()}
            <input
              type="text"
              placeholder="Nombre"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="number"
              placeholder="Monto"
              value={newCat.amount}
              onChange={(e) => setNewCat({ ...newCat, amount: e.target.value })}
              style={{ ...inputStyle, width: 90 }}
            />
          </div>
          {newIconOpen && (
            <IconPicker value={newCat.icon} onChange={(k) => setNewCat({ ...newCat, icon: k })} />
          )}
          <button style={{ ...btnGhost, width: "100%", marginTop: 10 }} onClick={addCat}>
            + Agregar
          </button>
        </div>

        {msg && <div style={{ color: colors.danger, fontSize: 12, marginTop: 12 }}>{msg}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={btnGhost} onClick={onClose}>Cancelar</button>
          <button style={{ ...btnPrimary, marginTop: 0, flex: 1 }} onClick={save}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

function MonthAmountModal({ title, cats, currentMap, onSave, onClose, accent }) {
  const [draft, setDraft] = useState({ ...currentMap });
  const total = Object.values(draft).reduce((s, v) => s + (Number(v) || 0), 0);

  const setVal = (id, v) => setDraft((d) => ({ ...d, [id]: parseFloat(v) || 0 }));

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
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 16 }}>
          Solo aplica a este mes. Los demás meses no cambian.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cats.map((c) => {
            const color = colorForCat(cats, c.id);
            return (
              <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <IconBadge iconKey={c.icon} color={color} size={34} />
                <div style={{ flex: 1, fontSize: 14 }}>{c.name}</div>
                <input
                  type="number"
                  value={draft[c.id] ?? 0}
                  onChange={(e) => setVal(c.id, e.target.value)}
                  style={{ ...inputStyle, width: 110 }}
                />
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${colors.cardBorder}`,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15,
            fontWeight: 800,
            color: accent,
          }}
        >
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={btnGhost} onClick={onClose}>Cancelar</button>
          <button
            style={{ ...btnPrimary, marginTop: 0, flex: 1, background: `linear-gradient(135deg, ${accent}, ${accent})` }}
            onClick={() => { onSave(draft); onClose(); }}
          >
            Guardar
          </button>
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
const selectStyle = {
  padding: "8px 8px",
  borderRadius: 8,
  background: "#0d1526",
  color: colors.text,
  border: "1px solid rgba(255,255,255,0.12)",
  fontSize: 12,
  width: 90,
};
const btnPrimary = {
  width: "100%",
  marginTop: 28,
  padding: "14px 0",
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
