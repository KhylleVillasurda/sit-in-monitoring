import { useState, useEffect, useRef } from "react";
import ccsLogo from "./assets/ccs-logo.png";

// ─── TERMINAL MODE ──────────────────────────────────────────────────────────
const termStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }
  :root {
    --bg: #0c0c0c; --terminal: #0f0f0f; --surface: #141414;
    --border: #2a2a2a; --border-focus: #39ff14; --green: #39ff14;
    --green-dim: #1a7a08; --amber: #ffb300; --red: #ff4444;
    --text: #cccccc; --muted: #555555; --white: #f0f0f0;
  }
  .term-root {
    min-height: 100vh; background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace; position: relative; overflow: hidden;
  }
  .term-root::before {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
    pointer-events: none; z-index: 100;
  }
  .terminal {
    width: 580px; background: var(--terminal); border: 1px solid var(--border); border-radius: 8px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(57,255,20,0.04);
    animation: termIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(16px); position: relative; z-index: 10;
  }
  @keyframes termIn { to { opacity: 1; transform: translateY(0); } }
  .terminal:focus-within { box-shadow: 0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(57,255,20,0.1), 0 0 40px rgba(57,255,20,0.04); }
  .titlebar { display: flex; align-items: center; gap: 8px; padding: 11px 16px; background: #131313; border-bottom: 1px solid var(--border); border-radius: 8px 8px 0 0; user-select: none; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot-red { background: #ff5f57; } .dot-yellow { background: #febc2e; } .dot-green-mac { background: #28c840; }
  .titlebar-title { flex: 1; text-align: center; font-size: 11px; color: var(--muted); letter-spacing: 0.06em; }
  .term-log { padding: 20px 22px 0; max-height: 200px; overflow: hidden; }
  .log-line { font-size: 12px; line-height: 1.9; white-space: pre; }
  .c-green { color: var(--green); } .c-muted { color: var(--muted); } .c-amber { color: var(--amber); } .c-red { color: var(--red); } .c-white { color: var(--white); }
  .term-sep { border: none; border-top: 1px solid #1c1c1c; margin: 18px 0 0; }
  .term-form { padding: 22px; }
  .field-label { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 11px; color: var(--muted); letter-spacing: 0.08em; }
  .label-prefix { color: var(--green-dim); }
  .label-hint { margin-left: auto; font-size: 10px; color: #2e2e2e; }
  .field-wrap { position: relative; margin-bottom: 16px; }
  .field-input { width: 100%; padding: 11px 42px 11px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--white); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; letter-spacing: 0.02em; }
  .field-input:focus { border-color: var(--border-focus); background: #111; box-shadow: 0 0 0 3px rgba(57,255,20,0.07); }
  .field-input::placeholder { color: #333; }
  .field-input.is-error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(255,68,68,0.07); }
  .toggle-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; padding: 3px 5px; border-radius: 2px; transition: color 0.15s, background 0.15s; text-transform: uppercase; }
  .toggle-btn:hover { color: var(--green); background: rgba(57,255,20,0.06); }
  .error-banner { display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; background: rgba(255,68,68,0.06); border: 1px solid rgba(255,68,68,0.2); border-radius: 4px; margin-bottom: 16px; animation: shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97); font-size: 11px; color: var(--red); letter-spacing: 0.03em; line-height: 1.6; }
  .error-banner-text { color: var(--red); font-size: 11px; }
  @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  .submit-btn { width: 100%; padding: 12px; background: var(--green); border: none; border-radius: 4px; color: #060606; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s; text-transform: uppercase; margin-top: 4px; }
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
  .mode-toggle-btn { position: fixed; bottom: 18px; right: 18px; z-index: 9999; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; padding: 6px 10px; cursor: pointer; transition: all 0.2s; opacity: 0.5; }
  .mode-toggle-btn:hover { opacity: 1; border-color: var(--green); color: var(--green); }
`;

// ─── FRIENDLY STYLES ────────────────────────────────────────────────────────
const friendlyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }

  .f-root {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden;
    padding: 24px; transition: background 0.4s;
  }
  .f-root.dark { background: #0d1117; }
  .f-root.light { background: #eef2f7; }

  .f-bg-blob {
    position: fixed; border-radius: 50%; filter: blur(90px);
    pointer-events: none; z-index: 0;
    animation: blobIn 1.4s ease forwards; opacity: 0;
  }
  @keyframes blobIn { to { opacity: 1; } }
  .dark .f-bg-blob-1 { width: 500px; height: 500px; top: -120px; left: -120px; background: radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 65%); }
  .dark .f-bg-blob-2 { width: 380px; height: 380px; bottom: -80px; right: -80px; background: radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 65%); }
  .light .f-bg-blob-1 { width: 500px; height: 500px; top: -120px; left: -120px; background: radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 65%); }
  .light .f-bg-blob-2 { width: 380px; height: 380px; bottom: -80px; right: -80px; background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%); }

  .f-card {
    width: 100%; max-width: 400px; border-radius: 24px;
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(22px) scale(0.98);
    position: relative; z-index: 10; overflow: hidden;
    transition: background 0.4s, box-shadow 0.4s, border-color 0.4s;
  }
  .dark .f-card { background: #161b22; border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 0 0 1px rgba(57,255,20,0.03), 0 40px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4); }
  .light .f-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04); }
  @keyframes cardIn { to { opacity: 1; transform: translateY(0) scale(1); } }

  .f-card-accent { height: 3px; width: 100%; background: linear-gradient(90deg, #39ff14 0%, #22c55e 60%, #16a34a 100%); }
  .light .f-card-accent { background: linear-gradient(90deg, #16a34a 0%, #22c55e 60%, #4ade80 100%); }

  .f-header { padding: 28px 32px 0; }

  /* Logo: image replaces emoji icon */
  .f-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; }
  .f-logo-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .dark .f-logo-icon { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 2px 12px rgba(57,255,20,0.1); }
  .light .f-logo-icon { background: #f0fdf4; border: 1px solid rgba(22,163,74,0.15); box-shadow: 0 2px 10px rgba(22,163,74,0.1); }
  .f-logo-icon img { width: 30px; height: 30px; object-fit: contain; }
  .f-logo-info { display: flex; flex-direction: column; gap: 2px; }
  .f-logo-name { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.1; }
  .dark .f-logo-name { color: #f0f6fc; }
  .light .f-logo-name { color: #0f172a; }
  .f-logo-tag { font-size: 11px; font-weight: 500; letter-spacing: 0.04em; font-family: 'DM Mono', monospace; }
  .dark .f-logo-tag { color: #39ff14; }
  .light .f-logo-tag { color: #16a34a; }

  .f-title { font-size: 23px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 5px; }
  .dark .f-title { color: #f0f6fc; }
  .light .f-title { color: #0f172a; }
  .f-subtitle { font-size: 14px; line-height: 1.5; }
  .dark .f-subtitle { color: #6e7681; }
  .light .f-subtitle { color: #6b7280; }

  .f-body { padding: 24px 32px 32px; }

  /* Online badge */
  .f-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 12px; border-radius: 20px; margin-bottom: 22px;
    font-size: 12px; font-weight: 600; font-family: 'DM Mono', monospace; letter-spacing: 0.01em;
  }
  .dark .f-badge { background: rgba(57,255,20,0.07); border: 1px solid rgba(57,255,20,0.14); color: #4ade80; }
  .light .f-badge { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
  .f-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; animation: bpulse 2s ease-in-out infinite; }
  .dark .f-badge-dot { background: #39ff14; }
  .light .f-badge-dot { background: #16a34a; }
  @keyframes bpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }

  .f-field { margin-bottom: 16px; }
  .f-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; letter-spacing: -0.01em; }
  .dark .f-label { color: #8b949e; }
  .light .f-label { color: #374151; }

  .f-input-wrap { position: relative; }
  .f-input {
    width: 100%; padding: 12px 16px; border-radius: 11px;
    font-family: 'DM Sans', sans-serif; font-size: 14.5px; font-weight: 400;
    outline: none; transition: all 0.18s; letter-spacing: -0.01em;
  }
  .dark .f-input { background: #0d1117; border: 1.5px solid #30363d; color: #f0f6fc; }
  .dark .f-input::placeholder { color: #3d444d; }
  .dark .f-input:focus { border-color: #39ff14; box-shadow: 0 0 0 3px rgba(57,255,20,0.09); }
  .light .f-input { background: #f8fafc; border: 1.5px solid #e2e8f0; color: #0f172a; }
  .light .f-input::placeholder { color: #9ca3af; }
  .light .f-input:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
  .f-input.is-error { border-color: #f85149 !important; box-shadow: 0 0 0 3px rgba(248,81,73,0.1) !important; }
  .f-input-with-btn { padding-right: 52px; }

  .f-eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 5px; border-radius: 7px; font-size: 15px; transition: opacity 0.15s; opacity: 0.4; line-height: 1; }
  .f-eye-btn:hover { opacity: 0.9; }

  .f-error-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 11px; margin-bottom: 18px; font-size: 13px; font-weight: 500; line-height: 1.5; background: rgba(248,81,73,0.08); border: 1.5px solid rgba(248,81,73,0.22); color: #f85149; animation: shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }
  @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }

  .f-submit { width: 100%; padding: 13px; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.18s; margin-top: 8px; letter-spacing: -0.01em; }
  .dark .f-submit { background: #39ff14; color: #060f00; }
  .dark .f-submit:hover:not(:disabled) { background: #4dff28; box-shadow: 0 0 0 4px rgba(57,255,20,0.15), 0 4px 20px rgba(57,255,20,0.3); transform: translateY(-1px); }
  .light .f-submit { background: #16a34a; color: #fff; }
  .light .f-submit:hover:not(:disabled) { background: #15803d; box-shadow: 0 0 0 4px rgba(22,163,74,0.12), 0 4px 20px rgba(22,163,74,0.25); transform: translateY(-1px); }
  .f-submit:active:not(:disabled) { transform: translateY(0) !important; }
  .f-submit:disabled { opacity: 0.4; cursor: not-allowed; }
  .f-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .f-spinner { width: 16px; height: 16px; border: 2.5px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin 0.65s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .f-footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
  .f-link { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; transition: color 0.15s; }
  .dark .f-link { color: #484f58; } .dark .f-link:hover { color: #8b949e; }
  .light .f-link { color: #9ca3af; } .light .f-link:hover { color: #4b5563; }

  .f-register-row { margin-top: 20px; padding-top: 18px; text-align: center; font-size: 13.5px; }
  .dark .f-register-row { border-top: 1px solid #21262d; color: #484f58; }
  .light .f-register-row { border-top: 1px solid #f1f5f9; color: #9ca3af; }
  .f-register-btn { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 700; cursor: pointer; padding: 0; margin-left: 5px; transition: color 0.15s; }
  .dark .f-register-btn { color: #39ff14; } .dark .f-register-btn:hover { color: #52ff2e; }
  .light .f-register-btn { color: #16a34a; } .light .f-register-btn:hover { color: #15803d; }

  .f-demo-hint { margin-top: 18px; padding: 10px 14px; border-radius: 9px; font-size: 11.5px; text-align: center; font-family: 'DM Mono', monospace; letter-spacing: 0.02em; }
  .dark .f-demo-hint { background: #0d1117; border: 1px solid #21262d; color: #3d444d; }
  .light .f-demo-hint { background: #f8fafc; border: 1px solid #e2e8f0; color: #9ca3af; }

  .corner-controls { position: fixed; bottom: 20px; right: 20px; display: flex; gap: 8px; z-index: 9999; align-items: center; }
  .corner-btn { padding: 7px 13px; border-radius: 9px; border: 1.5px solid; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; opacity: 0.55; }
  .corner-btn:hover { opacity: 1; transform: translateY(-1px); }
  .dark .corner-btn { background: #161b22; border-color: #30363d; color: #6e7681; }
  .dark .corner-btn:hover { border-color: #39ff14; color: #39ff14; background: rgba(57,255,20,0.05); }
  .light .corner-btn { background: #fff; border-color: #e2e8f0; color: #9ca3af; }
  .light .corner-btn:hover { border-color: #16a34a; color: #16a34a; }
`;

// ─── BOOT SEQUENCE ──────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "SITE-SENTINEL v2.1.0 — Infrastructure Monitor", cls: "c-green", delay: 0 },
  { text: "Copyright (c) 2026 Sentinel Systems.",          cls: "c-muted", delay: 80 },
  { text: "",                                               cls: "c-muted", delay: 130 },
  { text: "[ OK ] Kernel modules loaded.",                 cls: "c-muted", delay: 200 },
  { text: "[ OK ] Network interface up.",                  cls: "c-muted", delay: 330 },
  { text: "[ OK ] Secure channel established.",            cls: "c-green", delay: 480 },
  { text: "",                                               cls: "c-muted", delay: 560 },
  { text: "  Authentication required to continue.",        cls: "c-white", delay: 640 },
];

const LOAD_LINES = [
  { text: "[ OK ] Identity verified.",                        cls: "c-green", delay: 0 },
  { text: "[ OK ] Session token issued. TTL: 3600s",         cls: "c-green", delay: 300 },
  { text: "",                                                  cls: "c-muted", delay: 480 },
  { text: "> Initializing dashboard...",                      cls: "c-amber", delay: 600 },
  { text: "  Loading site registry..............  [DONE]",   cls: "c-muted", delay: 880 },
  { text: "  Fetching monitor configs............  [DONE]",  cls: "c-muted", delay: 1100 },
  { text: "  Connecting to uptime agents.........  [DONE]",  cls: "c-muted", delay: 1320 },
  { text: "  Resolving geo-location nodes........  [DONE]",  cls: "c-muted", delay: 1540 },
  { text: "  Mounting /dashboard/map.............  [DONE]",  cls: "c-muted", delay: 1760 },
  { text: "",                                                  cls: "c-muted", delay: 1900 },
  { text: "[ OK ] All systems nominal. 12 sites online.",    cls: "c-green", delay: 2050 },
  { text: "[ OK ] Dashboard ready. Launching...",            cls: "c-green", delay: 2300 },
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

// ─── FRIENDLY LOGIN ──────────────────────────────────────────────────────────
function FriendlyLogin({ onLogin, onGoToRegister, theme, onToggleTheme, onToggleMode }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [phase, setPhase]       = useState("form");
  const emailRef = useRef(null);

  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 400); }, []);

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
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    if (email === "admin@sentinel.io" && password === "password") {
      setLoading(false); setPhase("success");
    } else {
      setLoading(false);
      setError("Incorrect email or password. Please try again.");
    }
  };

  if (phase === "success") {
    return (
      <div className={`f-root ${theme}`}>
        <style>{friendlyStyles}</style>
        <div className={`f-bg-blob f-bg-blob-1 ${theme}`} />
        <div className={`f-bg-blob f-bg-blob-2 ${theme}`} />
        <div className="f-card">
          <div className="f-card-accent" />
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div className="f-title" style={{ marginBottom: 8 }}>You're in!</div>
            <div className="f-subtitle">Loading your dashboard…</div>
            <div style={{ marginTop: 28, height: 3, borderRadius: 3, overflow: "hidden", background: theme === "dark" ? "#21262d" : "#e2e8f0" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#39ff14,#22c55e)", width: "0%", animation: "loadBar 2.5s ease forwards", borderRadius: 3 }} />
            </div>
          </div>
          <style>{`@keyframes loadBar{from{width:0}to{width:100%}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={`f-root ${theme}`}>
      <style>{friendlyStyles}</style>
      <div className={`f-bg-blob f-bg-blob-1 ${theme}`} />
      <div className={`f-bg-blob f-bg-blob-2 ${theme}`} />

      <div className="f-card">
        <div className="f-card-accent" />

        <div className="f-header">
          <div className="f-logo-row">
            {/* CCS logo image replacing the shield emoji */}
            <div className="f-logo-icon">
              <img src={ccsLogo} alt="CCS Logo" />
            </div>
            <div className="f-logo-info">
              <span className="f-logo-name">Site Sentinel</span>
              <span className="f-logo-tag">CCS · UC</span>
            </div>
          </div>
          <div className="f-title">Welcome back 👋</div>
          <div className="f-subtitle">Sign in to your monitoring account</div>
        </div>

        <div className="f-body">
          <div className="f-badge">
            <span className="f-badge-dot" />
            All systems online · 12 sites monitored
          </div>

          {error && (
            <div className="f-error-banner">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <div className="f-field">
            <label className="f-label">Email address</label>
            <div className="f-input-wrap">
              <input
                ref={emailRef}
                className={`f-input${error && !email ? " is-error" : ""}`}
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@school.edu.ph"
                autoComplete="email"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
            </div>
          </div>

          <div className="f-field">
            <label className="f-label">Password</label>
            <div className="f-input-wrap">
              <input
                className={`f-input f-input-with-btn${error && !password ? " is-error" : ""}`}
                type={showPass ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                autoComplete="current-password"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
              <button className="f-eye-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button className="f-submit" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <span className="f-btn-inner"><span className="f-spinner" /> Signing you in…</span>
              : <span className="f-btn-inner">Sign in →</span>
            }
          </button>

          <div className="f-footer-row">
            <button className="f-link">Forgot password?</button>
            <button className="f-link" onClick={onGoToRegister}>Create account</button>
          </div>

          <div className="f-register-row">
            Don't have an account?
            <button className="f-register-btn" onClick={onGoToRegister}>Register here</button>
          </div>

          <div className="f-demo-hint">demo → admin@sentinel.io / password</div>
        </div>
      </div>

      <div className="corner-controls">
        <button className="corner-btn" onClick={onToggleTheme}>{theme === "dark" ? "☀ Light" : "🌙 Dark"}</button>
        <button className="corner-btn" onClick={onToggleMode}>&gt;_ CLI</button>
      </div>
    </div>
  );
}

// ─── TERMINAL LOGIN ──────────────────────────────────────────────────────────
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

  return (
    <>
      <style>{termStyles}</style>
      <div className="term-root">
        <div className="terminal">
          <div className="titlebar">
            <div className="dot dot-red" /><div className="dot dot-yellow" /><div className="dot dot-green-mac" />
            <span className="titlebar-title">sentinel@monitor: ~ — bash</span>
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

// ─── EXPORT ──────────────────────────────────────────────────────────────────
export default function Login({ onLogin, onGoToRegister, uiMode, theme, onToggleMode, onToggleTheme }) {
  if (uiMode === "terminal") {
    return <TerminalLogin onLogin={onLogin} onGoToRegister={onGoToRegister} onToggleMode={onToggleMode} />;
  }
  return <FriendlyLogin onLogin={onLogin} onGoToRegister={onGoToRegister} theme={theme} onToggleTheme={onToggleTheme} onToggleMode={onToggleMode} />;
}