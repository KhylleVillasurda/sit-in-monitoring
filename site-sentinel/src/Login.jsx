import { useState, useEffect, useRef } from "react";

// ─── TERMINAL MODE (original) ──────────────────────────────────────────────
const termStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }
  :root {
    --bg: #0c0c0c; --terminal: #0f0f0f; --surface: #141414;
    --border: #2a2a2a; --border-focus: #39ff14; --green: #39ff14;
    --green-dim: #1a7a08; --green-glow: rgba(57,255,20,0.12);
    --amber: #ffb300; --red: #ff4444; --text: #cccccc;
    --muted: #555555; --white: #f0f0f0;
  }
  .term-root {
    min-height: 100vh; background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    position: relative; overflow: hidden;
  }
  .term-root::before {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
    pointer-events: none; z-index: 100;
  }
  .terminal {
    width: 580px; background: var(--terminal);
    border: 1px solid var(--border); border-radius: 8px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(57,255,20,0.04);
    animation: termIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(16px); position: relative; z-index: 10;
  }
  @keyframes termIn { to { opacity: 1; transform: translateY(0); } }
  .terminal:focus-within { box-shadow: 0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(57,255,20,0.1), 0 0 40px rgba(57,255,20,0.04); }
  .titlebar {
    display: flex; align-items: center; gap: 8px; padding: 11px 16px;
    background: #131313; border-bottom: 1px solid var(--border);
    border-radius: 8px 8px 0 0; user-select: none;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot-red { background: #ff5f57; } .dot-yellow { background: #febc2e; } .dot-green-mac { background: #28c840; }
  .titlebar-title { flex: 1; text-align: center; font-size: 11px; color: var(--muted); letter-spacing: 0.06em; }
  .term-log { padding: 20px 22px 0; max-height: 200px; overflow: hidden; }
  .log-line { font-size: 12px; line-height: 1.9; white-space: pre; }
  .c-green { color: var(--green); } .c-muted { color: var(--muted); }
  .c-amber { color: var(--amber); } .c-red { color: var(--red); }
  .c-white { color: var(--white); }
  .term-sep { border: none; border-top: 1px solid #1c1c1c; margin: 18px 0 0; }
  .term-form { padding: 22px; }
  .field-label { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 11px; color: var(--muted); letter-spacing: 0.08em; }
  .label-prefix { color: var(--green-dim); }
  .label-hint { margin-left: auto; font-size: 10px; color: #2e2e2e; }
  .field-wrap { position: relative; margin-bottom: 16px; }
  .field-input {
    width: 100%; padding: 11px 42px 11px 14px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 4px; color: var(--white);
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; letter-spacing: 0.02em;
  }
  .field-input:focus { border-color: var(--border-focus); background: #111; box-shadow: 0 0 0 3px rgba(57,255,20,0.07), inset 0 0 12px rgba(57,255,20,0.02); }
  .field-input::placeholder { color: #333; }
  .field-input[type="password"]:not(:placeholder-shown) { letter-spacing: 0.18em; }
  .field-input.is-error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(255,68,68,0.07); }
  .toggle-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.06em; padding: 3px 5px; border-radius: 2px;
    transition: color 0.15s, background 0.15s; text-transform: uppercase;
  }
  .toggle-btn:hover { color: var(--green); background: rgba(57,255,20,0.06); }
  .error-banner {
    display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px;
    background: rgba(255,68,68,0.06); border: 1px solid rgba(255,68,68,0.2);
    border-radius: 4px; margin-bottom: 16px;
    animation: shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97);
    font-size: 11px; color: var(--red); letter-spacing: 0.03em; line-height: 1.6;
  }
  .error-banner-text { color: var(--red); font-size: 11px; }
  @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  .submit-btn {
    width: 100%; padding: 12px; background: var(--green); border: none; border-radius: 4px;
    color: #060606; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    text-transform: uppercase; margin-top: 4px;
  }
  .submit-btn:hover:not(:disabled) { background: #52ff2e; box-shadow: 0 0 20px rgba(57,255,20,0.3); transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .spinner { width: 13px; height: 13px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #060606; border-radius: 50%; animation: spin 0.65s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .form-footer { display: flex; justify-content: space-between; margin-top: 14px; }
  .footer-link { background: none; border: none; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: pointer; padding: 0; letter-spacing: 0.04em; transition: color 0.15s; }
  .footer-link:hover { color: var(--green); }
  .register-hint { margin-top: 12px; text-align: center; font-size: 11px; color: #2e2e2e; letter-spacing: 0.04em; }
  .footer-link-green { background: none; border: none; color: var(--green-dim); font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: pointer; padding: 0; letter-spacing: 0.04em; transition: color 0.15s; }
  .footer-link-green:hover { color: var(--green); }
  .boot-loader { padding: 20px 22px; }
  .progress-wrap { height: 2px; background: #1a1a1a; border-radius: 2px; overflow: hidden; margin-top: 8px; }
  .progress-bar { height: 100%; background: var(--green); box-shadow: 0 0 8px rgba(57,255,20,0.5); transition: width 0.35s ease; }
  .blink-cursor { display: inline-block; width: 7px; height: 12px; background: var(--green); animation: blink 1s step-end infinite; vertical-align: middle; }
  @keyframes blink { 50% { opacity: 0; } }
  .term-hint { padding: 10px 22px 14px; font-size: 10px; color: #222; border-top: 1px solid #161616; letter-spacing: 0.04em; }

  /* Terminal logo row */
  .term-logo-row {
    display: flex; align-items: center; justify-content: center; gap: 16px;
    padding: 14px 22px 0;
  }
  .term-logo-img {
    height: 36px; width: auto; object-fit: contain;
    filter: brightness(0.85) saturate(0.7);
    transition: filter 0.2s;
  }
  .term-logo-img:hover { filter: brightness(1) saturate(1); }

  /* Mode toggle button */
  .mode-toggle-btn {
    position: fixed; bottom: 18px; right: 18px; z-index: 9999;
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px;
    color: var(--muted); font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.06em; padding: 6px 10px;
    cursor: pointer; transition: all 0.2s; opacity: 0.5;
  }
  .mode-toggle-btn:hover { opacity: 1; border-color: var(--green); color: var(--green); }
`;

// ─── FRIENDLY STYLES ───────────────────────────────────────────────────────
const friendlyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }

  .f-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.4s, color 0.4s;
    position: relative; overflow: hidden; padding: 24px;
  }

  /* Dark theme */
  .f-root.dark {
    background: #0e1117;
    color: #e2e8f0;
  }
  /* Animated bg dots dark */
  .f-root.dark::before {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle at 20% 30%, rgba(57,255,20,0.04) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(57,255,20,0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Light theme */
  .f-root.light {
    background: #f0f4f8;
    color: #1a202c;
  }
  .f-root.light::before {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle at 20% 30%, rgba(57,200,20,0.06) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(57,200,20,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  .f-card {
    width: 100%; max-width: 420px;
    border-radius: 20px;
    animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(20px);
    position: relative; z-index: 10;
    transition: background 0.4s, box-shadow 0.4s, border-color 0.4s;
  }
  .dark .f-card {
    background: #151b23;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(57,255,20,0.04);
  }
  .light .f-card {
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 20px 60px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
  }
  @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }

  /* Header */
  .f-header { padding: 32px 32px 0; }

  /* Logo row with images */
  .f-logo-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  }
  .f-logo-img {
    height: 40px; width: auto; object-fit: contain; flex-shrink: 0;
  }
  .f-logo-divider {
    width: 1px; height: 28px; flex-shrink: 0;
  }
  .dark .f-logo-divider { background: rgba(255,255,255,0.12); }
  .light .f-logo-divider { background: rgba(0,0,0,0.12); }
  .f-logo-text-group { display: flex; flex-direction: column; gap: 1px; }
  .f-logo-text { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .dark .f-logo-text { color: #39ff14; }
  .light .f-logo-text { color: #1a7a08; }
  .f-logo-subtext { font-size: 10px; font-weight: 500; letter-spacing: 0.04em; }
  .dark .f-logo-subtext { color: #475569; }
  .light .f-logo-subtext { color: #94a3b8; }

  .f-title { font-size: 22px; font-weight: 700; line-height: 1.2; margin-bottom: 6px; }
  .dark .f-title { color: #f1f5f9; }
  .light .f-title { color: #0f172a; }

  .f-subtitle { font-size: 13.5px; font-weight: 400; line-height: 1.5; }
  .dark .f-subtitle { color: #64748b; }
  .light .f-subtitle { color: #64748b; }

  /* Body */
  .f-body { padding: 28px 32px 32px; }

  /* Status indicator row */
  .f-status-row {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-radius: 10px; margin-bottom: 22px;
  }
  .dark .f-status-row { background: rgba(57,255,20,0.06); border: 1px solid rgba(57,255,20,0.1); }
  .light .f-status-row { background: rgba(57,200,20,0.07); border: 1px solid rgba(57,200,20,0.15); }
  .f-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #39ff14; animation: pulse 2s ease-in-out infinite; flex-shrink: 0; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
  .f-status-text { font-size: 12px; font-weight: 500; }
  .dark .f-status-text { color: #4ade80; }
  .light .f-status-text { color: #15803d; }

  /* Form fields */
  .f-field { margin-bottom: 18px; }
  .f-label {
    display: block; font-size: 12.5px; font-weight: 600;
    margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .dark .f-label { color: #94a3b8; }
  .light .f-label { color: #374151; }

  .f-input-wrap { position: relative; }
  .f-input {
    width: 100%; padding: 12px 16px;
    border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 500; outline: none;
    transition: all 0.2s;
  }
  .dark .f-input {
    background: #1e2733; border: 1.5px solid #2a3441; color: #f1f5f9;
  }
  .dark .f-input::placeholder { color: #3d4f63; }
  .dark .f-input:focus { border-color: #39ff14; background: #1a2230; box-shadow: 0 0 0 3px rgba(57,255,20,0.08); }
  .light .f-input { background: #f8fafc; border: 1.5px solid #e2e8f0; color: #0f172a; }
  .light .f-input::placeholder { color: #94a3b8; }
  .light .f-input:focus { border-color: #22c55e; background: #fff; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .f-input.is-error { border-color: #f87171 !important; box-shadow: 0 0 0 3px rgba(248,113,113,0.1) !important; }

  .f-eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    border-radius: 6px; font-size: 15px; transition: opacity 0.15s; opacity: 0.5;
  }
  .f-eye-btn:hover { opacity: 1; }

  .f-error-msg { font-size: 12px; color: #f87171; margin-top: 5px; font-weight: 500; }

  /* Submit button */
  .f-submit {
    width: 100%; padding: 13px; border: none; border-radius: 11px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14.5px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; margin-top: 6px; letter-spacing: 0.01em;
  }
  .dark .f-submit { background: #39ff14; color: #0a1000; }
  .dark .f-submit:hover:not(:disabled) { background: #52ff2e; box-shadow: 0 4px 20px rgba(57,255,20,0.35); transform: translateY(-1px); }
  .light .f-submit { background: #16a34a; color: #fff; }
  .light .f-submit:hover:not(:disabled) { background: #15803d; box-shadow: 0 4px 20px rgba(22,163,74,0.3); transform: translateY(-1px); }
  .f-submit:active:not(:disabled) { transform: translateY(0); }
  .f-submit:disabled { opacity: 0.45; cursor: not-allowed; }
  .f-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .f-spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin 0.65s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer links */
  .f-footer { display: flex; justify-content: space-between; margin-top: 18px; }
  .f-link {
    background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.15s;
  }
  .dark .f-link { color: #475569; }
  .dark .f-link:hover { color: #39ff14; }
  .light .f-link { color: #94a3b8; }
  .light .f-link:hover { color: #16a34a; }

  .f-register-row { margin-top: 14px; text-align: center; font-size: 13px; }
  .dark .f-register-row { color: #475569; }
  .light .f-register-row { color: #94a3b8; }
  .f-register-link {
    background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 700; cursor: pointer; padding: 0; margin-left: 4px; transition: color 0.15s;
  }
  .dark .f-register-link { color: #4ade80; }
  .dark .f-register-link:hover { color: #39ff14; }
  .light .f-register-link { color: #16a34a; }
  .light .f-register-link:hover { color: #15803d; }

  /* Demo hint */
  .f-demo-hint {
    margin-top: 20px; padding: 11px 14px; border-radius: 9px;
    font-size: 12px; text-align: center; font-family: 'JetBrains Mono', monospace;
  }
  .dark .f-demo-hint { background: #0e1117; border: 1px solid #1e2733; color: #334155; }
  .light .f-demo-hint { background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8; }

  /* Error banner */
  .f-error-banner {
    display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px;
    border-radius: 10px; margin-bottom: 18px;
    font-size: 13px; font-weight: 500; line-height: 1.5;
    background: rgba(248,113,113,0.08); border: 1.5px solid rgba(248,113,113,0.25); color: #f87171;
    animation: shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97);
  }
  @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }

  /* Corner controls */
  .corner-controls {
    position: fixed; bottom: 18px; right: 18px;
    display: flex; gap: 8px; z-index: 9999; align-items: center;
  }
  .corner-btn {
    padding: 7px 12px; border-radius: 8px; border: 1.5px solid;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11.5px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
    opacity: 0.6;
  }
  .corner-btn:hover { opacity: 1; transform: translateY(-1px); }
  .dark .corner-btn { background: #151b23; border-color: #2a3441; color: #64748b; }
  .dark .corner-btn:hover { border-color: #39ff14; color: #39ff14; }
  .light .corner-btn { background: #ffffff; border-color: #e2e8f0; color: #94a3b8; }
  .light .corner-btn:hover { border-color: #16a34a; color: #16a34a; }
`;

// ─── BOOT SEQUENCE ─────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "SITE-SENTINEL v2.1.0 — Infrastructure Monitor", cls: "c-green",  delay: 0 },
  { text: "Copyright (c) 2026 Sentinel Systems.",          cls: "c-muted",  delay: 80 },
  { text: "",                                               cls: "c-muted",  delay: 130 },
  { text: "[ OK ] Kernel modules loaded.",                 cls: "c-muted",  delay: 200 },
  { text: "[ OK ] Network interface up.",                  cls: "c-muted",  delay: 330 },
  { text: "[ OK ] Secure channel established.",            cls: "c-green",  delay: 480 },
  { text: "",                                               cls: "c-muted",  delay: 560 },
  { text: "  Authentication required to continue.",        cls: "c-white",  delay: 640 },
];

const LOAD_LINES = [
  { text: "[ OK ] Identity verified.",                          cls: "c-green", delay: 0 },
  { text: "[ OK ] Session token issued. TTL: 3600s",           cls: "c-green", delay: 300 },
  { text: "",                                                    cls: "c-muted", delay: 480 },
  { text: "> Initializing dashboard...",                        cls: "c-amber", delay: 600 },
  { text: "  Loading site registry..............  [DONE]",     cls: "c-muted", delay: 880 },
  { text: "  Fetching monitor configs............  [DONE]",    cls: "c-muted", delay: 1100 },
  { text: "  Connecting to uptime agents.........  [DONE]",   cls: "c-muted", delay: 1320 },
  { text: "  Resolving geo-location nodes........  [DONE]",   cls: "c-muted", delay: 1540 },
  { text: "  Mounting /dashboard/map.............  [DONE]",   cls: "c-muted", delay: 1760 },
  { text: "",                                                    cls: "c-muted", delay: 1900 },
  { text: "[ OK ] All systems nominal. 12 sites online.",      cls: "c-green", delay: 2050 },
  { text: "[ OK ] Dashboard ready. Launching...",              cls: "c-green", delay: 2300 },
];

function TerminalBootLoader({ onDone }) {
  const [visible, setVisible] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    LOAD_LINES.forEach((l, i) => setTimeout(() => setVisible(i + 1), l.delay));
    setTimeout(() => onDone?.(), LOAD_LINES[LOAD_LINES.length - 1].delay + 900);
  }, []);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [visible]);
  const progress = Math.round((visible / LOAD_LINES.length) * 100);
  return (
    <div className="boot-loader">
      {LOAD_LINES.slice(0, visible).map((l, i) => (
        <div key={i} className={`log-line ${l.cls}`}>{l.text}</div>
      ))}
      {visible < LOAD_LINES.length && (
        <span className="log-line c-muted">{"  "}<span className="blink-cursor" /></span>
      )}
      <div className="progress-wrap" style={{ marginTop: "14px" }}>
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div ref={ref} />
    </div>
  );
}

// ─── FRIENDLY LOGIN ────────────────────────────────────────────────────────
function FriendlyLogin({ onLogin, onGoToRegister, theme, onToggleTheme, onToggleMode }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [phase, setPhase]       = useState("form");
  const emailRef = useRef(null);

  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 300); }, []);

  const validate = () => {
    if (!email.trim()) return "Please enter your email address.";
    if (!/\S+@\S+\.\S+/.test(email)) return "That doesn't look like a valid email.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    if (email === "admin@sentinel.io" && password === "password") {
      setLoading(false);
      setPhase("success");
    } else {
      setLoading(false);
      setError("Incorrect email or password. Please try again.");
    }
  };

  if (phase === "success") {
    return (
      <div className={`f-root ${theme}`}>
        <style>{friendlyStyles}</style>
        <div className="f-card" style={{ padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div className="f-title">Welcome back!</div>
          <div className="f-subtitle" style={{ marginTop: 8 }}>Loading your dashboard…</div>
          <div style={{ marginTop: 24, height: 4, borderRadius: 4, overflow: "hidden", background: theme === "dark" ? "#1e2733" : "#e2e8f0" }}>
            <div style={{ height: "100%", background: "#39ff14", width: "100%", animation: "load 2.5s ease forwards", borderRadius: 4 }} />
          </div>
          <style>{`@keyframes load { from{width:0} to{width:100%} }`}</style>
        </div>
        <style>{friendlyStyles}</style>
      </div>
    );
  }

  return (
    <div className={`f-root ${theme}`}>
      <style>{friendlyStyles}</style>

      <div className="f-card">
        <div className="f-header">
          {/* Logo row: CCS logo + divider + UC logo + app name */}
          <div className="f-logo-row">
            <img
              src="assets/ccslogo.png"
              alt="CCS Logo"
              className="f-logo-img"
            />
            <div className="f-logo-divider" />
            <img
              src="assets/uclogo.png"
              alt="UC Logo"
              className="f-logo-img"
            />
            <div className="f-logo-divider" />
            <div className="f-logo-text-group">
              <span className="f-logo-text">Site Sentinel</span>
              <span className="f-logo-subtext">CCS · University of Cebu</span>
            </div>
          </div>
          <div className="f-title">Welcome back</div>
          <div className="f-subtitle">Sign in to your monitoring account</div>
        </div>

        <div className="f-body">
          {/* Status bar */}
          <div className="f-status-row">
            <div className="f-status-dot" />
            <span className="f-status-text">Secure connection established · 12 sites online</span>
          </div>

          {/* Error */}
          {error && (
            <div className="f-error-banner">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="f-field">
            <label className="f-label">Email address</label>
            <div className="f-input-wrap">
              <input
                ref={emailRef}
                className={`f-input${error && !email ? " is-error" : ""}`}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@school.edu.ph"
                autoComplete="email"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="f-field">
            <label className="f-label">Password</label>
            <div className="f-input-wrap">
              <input
                className={`f-input${error && !password ? " is-error" : ""}`}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                autoComplete="current-password"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button className="f-eye-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button className="f-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span className="f-btn-inner"><span className="f-spinner" /> Signing you in…</span>
            ) : (
              <span className="f-btn-inner">Sign in →</span>
            )}
          </button>

          {/* Footer */}
          <div className="f-footer">
            <button className="f-link">Forgot password?</button>
            <button className="f-link" onClick={onGoToRegister}>Create account</button>
          </div>

          {/* Demo hint */}
          <div className="f-demo-hint">
            demo → admin@sentinel.io / password
          </div>
        </div>
      </div>

      {/* Corner controls */}
      <div className="corner-controls">
        <button className="corner-btn" onClick={onToggleTheme}>
          {theme === "dark" ? "☀ Light" : "🌙 Dark"}
        </button>
        <button className="corner-btn" onClick={onToggleMode} title="Switch to terminal mode">
          &gt;_ CLI
        </button>
      </div>
    </div>
  );
}

// ─── TERMINAL LOGIN (original) ─────────────────────────────────────────────
function TerminalLogin({ onLogin, onGoToRegister, onToggleMode }) {
  const [bootVisible, setBootVisible] = useState(0);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [phase, setPhase]       = useState("form");
  const emailRef = useRef(null);

  useEffect(() => {
    BOOT_LINES.forEach((l, i) => setTimeout(() => setBootVisible(i + 1), l.delay));
    setTimeout(() => emailRef.current?.focus(), BOOT_LINES[BOOT_LINES.length - 1].delay + 200);
  }, []);

  const validate = () => {
    if (!email.trim()) return "Identifier is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!password) return "Access key is required.";
    if (password.length < 6) return "Access key must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true); setPhase("loading-auth");
    await new Promise(r => setTimeout(r, 1800));
    if (email === "admin@sentinel.io" && password === "password") {
      setLoading(false); setPhase("success");
    } else {
      setLoading(false); setPhase("form");
      setError("ERROR: Access denied. Invalid credentials. [AUTH_FAIL_403]");
    }
  };

  const booted = bootVisible >= BOOT_LINES.length;

  return (
    <>
      <style>{termStyles}</style>
      <div className="term-root">
        <div className="terminal">
          <div className="titlebar">
            <div className="dot dot-red" /><div className="dot dot-yellow" /><div className="dot dot-green-mac" />
            <span className="titlebar-title">sentinel@monitor: ~ — bash</span>
          </div>

          {/* Terminal logo row */}
          <div className="term-logo-row">
            <img src="/ccslogo.png" alt="CCS Logo" className="term-logo-img" />
            <img src="/uclogo.png" alt="UC Logo" className="term-logo-img" />
          </div>

          <div className="term-log">
            {BOOT_LINES.slice(0, bootVisible).map((l, i) => (
              <div key={i} className={`log-line ${l.cls}`}>{l.text}</div>
            ))}
          </div>
          <hr className="term-sep" />
          {phase === "success" ? (
            <TerminalBootLoader onDone={onLogin} />
          ) : (
            <div className="term-form">
              {error && (
                <div className="error-banner">
                  <span style={{ color: "var(--red)", fontSize: "13px" }}>✕</span>
                  <span className="error-banner-text">{error}</span>
                </div>
              )}
              <div className="field-label"><span className="label-prefix">//</span><span>identifier</span><span className="label-hint">your login email</span></div>
              <div className="field-wrap">
                <input ref={emailRef} className={`field-input${error && !email ? " is-error" : ""}`}
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="user@domain.io" autoComplete="email" spellCheck={false}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={loading} />
              </div>
              <div className="field-label"><span className="label-prefix">//</span><span>access key</span><span className="label-hint">your password</span></div>
              <div className="field-wrap">
                <input className={`field-input${error && !password ? " is-error" : ""}`}
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="enter your access key" autoComplete="current-password"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={loading} />
                <button className="toggle-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                  {showPass ? "hide" : "show"}
                </button>
              </div>
              <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="btn-inner"><span className="spinner" /> Authenticating...</span>
                         : <span className="btn-inner">$ ./authenticate.sh</span>}
              </button>
              <div className="form-footer">
                <button className="footer-link">forgot access key?</button>
                <button className="footer-link" onClick={onGoToRegister}>./register</button>
              </div>
              <div className="register-hint">
                no account yet?{" "}
                <button className="footer-link-green" onClick={onGoToRegister}>create one here</button>
              </div>
            </div>
          )}
          <div className="term-hint">demo → admin@sentinel.io / password</div>
        </div>
        <button className="mode-toggle-btn" onClick={onToggleMode}>⊞ friendly UI</button>
      </div>
    </>
  );
}

// ─── EXPORTED COMPONENT ────────────────────────────────────────────────────
export default function Login({ onLogin, onGoToRegister, uiMode, theme, onToggleMode, onToggleTheme }) {
  if (uiMode === "terminal") {
    return <TerminalLogin onLogin={onLogin} onGoToRegister={onGoToRegister} onToggleMode={onToggleMode} />;
  }
  return <FriendlyLogin onLogin={onLogin} onGoToRegister={onGoToRegister} theme={theme} onToggleTheme={onToggleTheme} onToggleMode={onToggleMode} />;
}