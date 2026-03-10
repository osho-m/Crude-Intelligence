
import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

// ── Oil price timeline data ──────────────────────────────────────────────────
const oilData = [
  { date: "Feb 20", brent: 74.2, wti: 70.1, event: null },
  { date: "Feb 24", brent: 75.8, wti: 71.4, event: null },
  { date: "Feb 28", brent: 77.1, wti: 73.0, event: "Trump EO banning Anthropic" },
  { date: "Mar 1",  brent: 83.4, wti: 79.2, event: null },
  { date: "Mar 3",  brent: 96.7, wti: 91.4, event: "US-Israel strikes begin" },
  { date: "Mar 4",  brent: 104.2, wti: 99.8, event: null },
  { date: "Mar 5",  brent: 111.5, wti: 107.3, event: null },
  { date: "Mar 6",  brent: 108.9, wti: 104.1, event: "AJ reports Claude targeting" },
  { date: "Mar 7",  brent: 114.3, wti: 109.2, event: null },
  { date: "Mar 8",  brent: 119.8, wti: 115.6, event: "Peak — $120/barrel" },
  { date: "Mar 9",  brent: 98.7,  wti: 94.2, event: "Trump: 'short-term excursion'" },
  { date: "Mar 10", brent: 93.1,  wti: 88.9, event: "Hormuz threat — 6% drop" },
];

// ── World impact data ─────────────────────────────────────────────────────────
const worldImpact = [
  { country: "Japan",        impact: 92, type: "importer", detail: "Nikkei +3.3% on easing" },
  { country: "South Korea",  impact: 89, type: "importer", detail: "Kospi +6.2% relief rally" },
  { country: "India",        impact: 85, type: "importer", detail: "Fuel subsidy pressure" },
  { country: "Germany",      impact: 78, type: "importer", detail: "Manufacturing cost surge" },
  { country: "China",        impact: 76, type: "importer", detail: "Hang Seng +1.7%" },
  { country: "Bangladesh",   impact: 71, type: "importer", detail: "Pump prices +22%" },
  { country: "Philippines",  impact: 68, type: "importer", detail: "Transport cost crisis" },
  { country: "UK",           impact: 61, type: "importer", detail: "Rachel Reeves: de-escalate" },
  { country: "Saudi Arabia", impact: 55, type: "exporter", detail: "Revenue windfall" },
  { country: "Russia",       impact: 48, type: "exporter", detail: "Sanctions pressure eased" },
  { country: "USA",          impact: 40, type: "mixed",    detail: "Pump prices +18%" },
  { country: "Nigeria",      impact: 30, type: "exporter", detail: "Budget surplus" },
];

// ── ML scenario predictions ────────────────────────────────────────────────────
const scenarioData = {
  escalation: [
    { week: "Now",   price: 93 },
    { week: "W+1",   price: 108 },
    { week: "W+2",   price: 127 },
    { week: "W+3",   price: 145 },
    { week: "W+4",   price: 162 },
  ],
  ceasefire: [
    { week: "Now",   price: 93 },
    { week: "W+1",   price: 85 },
    { week: "W+2",   price: 78 },
    { week: "W+3",   price: 74 },
    { week: "W+4",   price: 71 },
  ],
  hormuz: [
    { week: "Now",   price: 93 },
    { week: "W+1",   price: 134 },
    { week: "W+2",   price: 178 },
    { week: "W+3",   price: 203 },
    { week: "W+4",   price: 241 },
  ],
};

// ── Claude's Military Role Timeline ───────────────────────────────────────────
const claudeTimeline = [
  {
    phase: "Phase 1: Intelligence Synthesis",
    icon: "01",
    date: "Mar 1–2, 2026",
    description: "Claude, embedded in Palantir's Maven Smart System, processed satellite imagery, signals intelligence, and surveillance feeds in real-time across classified military networks.",
    techStack: ["RAG", "Computer Vision", "NLP"],
  },
  {
    phase: "Phase 2: Target Generation",
    icon: "02",
    date: "Mar 3, 2026 (Day 1)",
    description: "On the first day of Operation Epic Fury, Claude generated ~1,000 prioritized targets with precise GPS coordinates and weapons recommendations from synthesized multi-source intelligence.",
    techStack: ["LLM Reasoning", "Geospatial AI", "Decision Trees"],
  },
  {
    phase: "Phase 3: Legal Justification",
    icon: "03",
    date: "Mar 3–10, 2026",
    description: "Claude auto-generated legal justifications for each strike target under international humanitarian law — a controversial use of GenAI for compliance in lethal operations.",
    techStack: ["Legal AI", "GenAI", "Document Generation"],
  },
  {
    phase: "Phase 4: Political Fallout",
    icon: "04",
    date: "Feb 28 / Mar 6, 2026",
    description: "Trump banned Anthropic via executive order hours before strikes began over refusal to allow unrestricted military use. OpenAI and xAI moved in to fill the gap.",
    techStack: ["Policy", "Ethics", "AI Governance"],
  },
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const OilTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = oilData.find(d => d.date === label);
  return (
    <div style={{
      background: "rgba(10,12,20,0.97)",
      border: "1px solid #f59e0b",
      borderRadius: 8,
      padding: "12px 16px",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 12,
    }}>
      <p style={{ color: "#f59e0b", marginBottom: 6, fontWeight: 700 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>${p.value}</strong>
        </p>
      ))}
      {point?.event && (
        <p style={{ color: "#ef4444", marginTop: 6, fontSize: 11 }}>
          {point.event}
        </p>
      )}
    </div>
  );
};

// ── RAG Chat Component ─────────────────────────────────────────────────────────
const RAGChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "I'm an AI analyst with RAG access to real-time data on the US-Iran war, oil markets, and Claude AI's military deployment. Ask me anything — oil price forecasts, geopolitical risk, Claude's battlefield role, or global economic impact."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const SYSTEM_PROMPT = `You are an expert AI analyst embedded in a geopolitical intelligence dashboard. You have RAG access to the following real-time knowledge base:

CONTEXT DOCUMENTS:
1. US-Iran War (March 2026): The US and Israel launched Operation Epic Fury against Iran starting March 3, 2026. Mojtaba Khamenei named new supreme leader after strikes.
2. Oil Prices: Brent crude peaked at ~$120/barrel on March 8, fell to $93 on March 10 after Trump called it "short-term excursion." Hormuz threat drove 6% single-day drop.
3. Claude AI Military Use: Anthropic's Claude was embedded in Palantir's Maven Smart System. Generated ~1,000 prioritized targets on Day 1. Used satellite imagery, SIGINT, and surveillance feeds. Auto-generated legal justifications for strikes. Trump banned Anthropic days before war started; OpenAI and xAI filled the gap.
4. Global Impact: Japan Nikkei +3.3%, South Korea Kospi +6.2% on easing news. Oil 20% higher than pre-war. G7 discussed IEA reserve release.
5. Strait of Hormuz: ~20% of world oil passes through it. Trump threatened Iran 20x harder retaliation if blocked.
6. ML Scenario Analysis: Escalation → $162/barrel by W+4. Ceasefire → $71/barrel. Hormuz closure → $241/barrel.

You are helpful, precise, and analytical. Cite specific data when possible. Keep responses to 2-4 paragraphs. Use technical AI/ML terminology naturally. Never make up facts — only use the above context.`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Analysis unavailable.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please retry." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "How is Claude being used in Iran targeting?",
    "What happens to oil if Hormuz is blocked?",
    "Which countries are most affected economically?",
    "Compare Escalation vs Ceasefire scenarios",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              background: m.role === "user"
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "rgba(255,255,255,0.05)",
              border: m.role === "assistant" ? "1px solid rgba(245,158,11,0.2)" : "none",
              color: m.role === "user" ? "#000" : "#e2e8f0",
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {m.role === "assistant" && (
                <div style={{ color: "#f59e0b", fontSize: 10, marginBottom: 4, fontWeight: 700 }}>
                  ◆ AI ANALYST · RAG
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: "8px 16px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#f59e0b",
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 20,
              color: "#f59e0b",
              padding: "4px 10px",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid rgba(245,158,11,0.15)",
        display: "flex",
        gap: 8,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Query the intelligence database..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 8,
            color: "#e2e8f0",
            padding: "8px 12px",
            fontSize: 13,
            outline: "none",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          background: loading ? "rgba(245,158,11,0.3)" : "#f59e0b",
          border: "none",
          borderRadius: 8,
          color: "#000",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {loading ? "..." : "SEND"}
        </button>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState("ceasefire");
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview",   label: "Oil Markets" },
    { id: "world",      label: "World Impact" },
    { id: "claude",     label: "Claude's Role" },
    { id: "predict",    label: "ML Forecast" },
    { id: "rag",        label: "AI Analyst" },
  ];

  const scenarioColors = {
    ceasefire:   "#22c55e",
    escalation:  "#f59e0b",
    hormuz:      "#ef4444",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      color: "#e2e8f0",
      fontFamily: "'IBM Plex Mono', monospace",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@300;400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; scrollbar-width: thin; scrollbar-color: #f59e0b #111; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #f59e0b; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:0.85} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px #f59e0b44} 50%{box-shadow:0 0 20px #f59e0b88} }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(245,158,11,0.2)",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, #f59e0b, #ef4444, #f59e0b, transparent)",
          animation: "flicker 3s ease-in-out infinite",
        }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", background: "#ef4444",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
            <span style={{ color: "#ef4444", fontSize: 11, letterSpacing: 3, fontWeight: 700 }}>
              CLASSIFIED · LIVE INTELLIGENCE
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(18px, 3vw, 32px)",
            fontWeight: 900,
            color: "#fff",
            marginTop: 8,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}>
            US–IRAN WAR: OIL CRISIS<br/>
            <span style={{ color: "#f59e0b" }}>& CLAUDE AI</span>{" "}
            <span style={{ color: "#94a3b8", fontWeight: 300 }}>INTELLIGENCE DASHBOARD</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
            MARCH 2026 · DEEP LEARNING + RAG + GENAI · REAL-TIME ANALYSIS
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#22c55e", fontSize: 22, fontWeight: 700 }}>$93.05</div>
          <div style={{ color: "#ef4444", fontSize: 11 }}>BRENT CRUDE ▼ 6%</div>
          <div style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>MAR 10, 2026</div>
        </div>
      </div>

      {/* Stat Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(245,158,11,0.03)",
      }}>
        {[
          { label: "PEAK PRICE", val: "$119.80", sub: "Mar 8 Brent", color: "#ef4444" },
          { label: "PRE-WAR", val: "$74.20", sub: "Feb 20 Brent", color: "#22c55e" },
          { label: "SURGE", val: "+61%", sub: "Total increase", color: "#f59e0b" },
          { label: "TARGETS", val: "~1,000", sub: "Day-1 by Claude", color: "#a78bfa" },
          { label: "HORMUZ", val: "20%", sub: "World oil flow", color: "#38bdf8" },
          { label: "CLAUDE STATUS", val: "BANNED", sub: "Trump EO Feb 28", color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "12px 20px",
            borderRight: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ color: "#475569", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ color: s.color, fontSize: 20, fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: "#475569", fontSize: 10 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(0,0,0,0.3)",
        overflowX: "auto",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "14px 24px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === t.id ? "2px solid #f59e0b" : "2px solid transparent",
            color: activeTab === t.id ? "#f59e0b" : "#475569",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: activeTab === t.id ? 700 : 400,
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px", minHeight: "60vh" }}>

        {/* ── TAB: OIL MARKETS ── */}
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2, marginBottom: 4 }}>
                BRENT CRUDE & WTI · PRICE TIMELINE
              </h2>
              <p style={{ color: "#475569", fontSize: 12 }}>
                Deep learning LSTM model tracking price volatility across conflict phases
              </p>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oilData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="wtiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} domain={[65, 130]} />
                  <Tooltip content={<OilTooltip />} />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "$100 threshold", fill: "#ef4444", fontSize: 10 }} />
                  <Area type="monotone" dataKey="brent" name="Brent Crude" stroke="#f59e0b" strokeWidth={2.5} fill="url(#brentGrad)" dot={{ fill: "#f59e0b", r: 4 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="wti" name="WTI" stroke="#38bdf8" strokeWidth={2} fill="url(#wtiGrad)" dot={{ fill: "#38bdf8", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Event annotations */}
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[
                { date: "Feb 28", label: "Trump bans Anthropic's Claude", color: "#a78bfa", icon: "" },
                { date: "Mar 3",  label: "Operation Epic Fury begins — oil jumps 16%", color: "#ef4444", icon: "" },
                { date: "Mar 8",  label: "Peak: $119.80/barrel", color: "#f59e0b", icon: "" },
                { date: "Mar 10", label: "Hormuz threat — 6% single-day drop", color: "#22c55e", icon: "" },
              ].map((e, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${e.color}33`,
                  borderLeft: `3px solid ${e.color}`,
                  borderRadius: 6,
                  padding: "10px 14px",
                }}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>{e.date}</div>
                  <div style={{ fontSize: 12, color: "#e2e8f0" }}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: WORLD IMPACT ── */}
        {activeTab === "world" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2, marginBottom: 4 }}>
                GLOBAL ECONOMIC IMPACT INDEX
              </h2>
              <p style={{ color: "#475569", fontSize: 12 }}>
                NLP sentiment + economic model scoring countries by oil dependency and exposure
              </p>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={worldImpact} layout="vertical" margin={{ top: 0, right: 80, bottom: 0, left: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <YAxis dataKey="country" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = worldImpact.find(d => d.country === payload[0]?.payload?.country);
                      return (
                        <div style={{
                          background: "#0a0c14", border: "1px solid #f59e0b55",
                          borderRadius: 6, padding: "10px 14px",
                          fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                        }}>
                          <p style={{ color: "#f59e0b", marginBottom: 4 }}>{item?.country}</p>
                          <p style={{ color: "#e2e8f0" }}>Impact Score: <strong>{item?.impact}/100</strong></p>
                          <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>{item?.detail}</p>
                          <p style={{ color: item?.type === "exporter" ? "#22c55e" : item?.type === "importer" ? "#ef4444" : "#f59e0b", fontSize: 10, marginTop: 2 }}>
                            {item?.type?.toUpperCase()}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}
                    fill="#f59e0b"
                    label={{ position: "right", fill: "#475569", fontSize: 10, formatter: v => `${v}` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { type: "importer", color: "#ef4444", label: "Net Importers — highest pain" },
                { type: "exporter", color: "#22c55e", label: "Net Exporters — revenue windfall" },
                { type: "mixed",    color: "#f59e0b", label: "Mixed exposure" },
              ].map(l => (
                <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: CLAUDE'S ROLE ── */}
        {activeTab === "claude" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2, marginBottom: 4 }}>
                CLAUDE AI · BATTLEFIELD DEPLOYMENT TIMELINE
              </h2>
              <p style={{ color: "#475569", fontSize: 12 }}>
                How Anthropic's LLM was integrated into Palantir Maven Smart System for Operation Epic Fury
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              <div style={{
                position: "absolute", left: 22, top: 0, bottom: 0, width: 1,
                background: "linear-gradient(180deg, #f59e0b, #ef4444, #a78bfa, #475569)",
              }} />
              {claudeTimeline.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 20, paddingLeft: 56, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 12, top: 12,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#060810",
                    border: `2px solid ${["#f59e0b", "#ef4444", "#a78bfa", "#475569"][i]}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid rgba(${["245,158,11", "239,68,68", "167,139,250", "71,85,105"][i]},0.2)`,
                    borderRadius: 10,
                    padding: "16px 20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{item.phase}</span>
                      </div>
                      <span style={{ color: "#475569", fontSize: 11 }}>{item.date}</span>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
                      {item.description}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {item.techStack.map(t => (
                        <span key={t} style={{
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.25)",
                          color: "#f59e0b",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 10,
                          letterSpacing: 1,
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: ML FORECAST ── */}
        {activeTab === "predict" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2, marginBottom: 4 }}>
                ML SCENARIO FORECASTING
              </h2>
              <p style={{ color: "#475569", fontSize: 12 }}>
                LSTM + Monte Carlo simulation — 4-week oil price projections under 3 geopolitical scenarios
              </p>
            </div>

            {/* Scenario selector */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { id: "ceasefire",  label: "CEASEFIRE",  color: "#22c55e", target: "$71" },
                { id: "escalation", label: "ESCALATION", color: "#f59e0b", target: "$162" },
                { id: "hormuz",     label: "HORMUZ BLOCKED", color: "#ef4444", target: "$241" },
              ].map(s => (
                <button key={s.id} onClick={() => setActiveScenario(s.id)} style={{
                  padding: "10px 20px",
                  background: activeScenario === s.id ? `${s.color}22` : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${activeScenario === s.id ? s.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  color: activeScenario === s.id ? s.color : "#475569",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: activeScenario === s.id ? 700 : 400,
                  transition: "all 0.2s",
                }}>
                  {s.label} → <strong>{s.target}</strong>
                </button>
              ))}
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scenarioData[activeScenario]} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#0a0c14", border: `1px solid ${scenarioColors[activeScenario]}55`, borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}
                    labelStyle={{ color: "#f59e0b" }}
                    formatter={v => [`$${v}/barrel`, "Projected Price"]}
                  />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "$100", fill: "#ef4444", fontSize: 10 }} />
                  <Line
                    type="monotone" dataKey="price" stroke={scenarioColors[activeScenario]}
                    strokeWidth={3} dot={{ fill: scenarioColors[activeScenario], r: 6, strokeWidth: 0 }}
                    activeDot={{ r: 8 }} strokeDasharray={activeScenario === "ceasefire" ? "0" : "0"}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scenario details */}
            <div style={{
              marginTop: 20,
              background: `rgba(${activeScenario === "ceasefire" ? "34,197,94" : activeScenario === "escalation" ? "245,158,11" : "239,68,68"},0.05)`,
              border: `1px solid ${scenarioColors[activeScenario]}33`,
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              <h3 style={{ color: scenarioColors[activeScenario], fontSize: 12, letterSpacing: 2, marginBottom: 10 }}>
                ◆ SCENARIO ANALYSIS · {activeScenario.toUpperCase()}
              </h3>
              {activeScenario === "ceasefire" && (
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
                  A negotiated ceasefire returns Brent to ~$71/barrel within 4 weeks. Supply fears ease, G7 IEA reserves released. Trump's "short-term excursion" framing supports this narrative. South Korean Kospi and Nikkei would sustain recovery. ML confidence: <span style={{ color: "#22c55e" }}>68%</span>
                </p>
              )}
              {activeScenario === "escalation" && (
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
                  Continued strikes and Iranian retaliation push Brent to $162 by W+4. OPEC+ emergency cuts unlikely. Global inflation spike; Fed forced to hold rates. Central banks in Asia face severe currency pressure. ML confidence: <span style={{ color: "#f59e0b" }}>24%</span>
                </p>
              )}
              {activeScenario === "hormuz" && (
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
                  Strait of Hormuz closure is a black swan event. 20% of global oil supply disrupted. Brent reaches $241/barrel within 4 weeks — levels not seen in history. Global recession probability exceeds 80%. Strategic reserves would last ~45 days. ML confidence: <span style={{ color: "#ef4444" }}>8%</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: RAG AI ANALYST ── */}
        {activeTab === "rag" && (
          <div style={{ display: "flex", flexDirection: "column", height: "65vh" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2, marginBottom: 4 }}>
                AI ANALYST · RAG-POWERED INTELLIGENCE CHAT
              </h2>

            </div>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 12,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}>
              <RAGChat />
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        padding: "14px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(0,0,0,0.4)",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <span style={{ color: "#1e293b", fontSize: 11 }}>
          DEEP LEARNING · RAG · GENAI · LLM · GEOSPATIAL AI · DECISION INTELLIGENCE
        </span>
        <span style={{ color: "#1e293b", fontSize: 11 }}>
          DATA: BBC · AL JAZEERA · REUTERS · WaPo · MARCH 2026
        </span>
      </div>
    </div>
  );
}
