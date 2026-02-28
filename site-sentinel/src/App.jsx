import { useState, useEffect, useRef } from "react";

// ─── SHARED CONSTANTS ────────────────────────────────────────────────────────

const DEMO = { email: "admin@sentinel.io", password: "password" };

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

// ─── TERMINAL STYLES ─────────────────────────────────────────────────────────

const terminalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }

  :root {
    --bg: #0c0c0c; --terminal: #0f0f0f; --surface: #141414;
    --border: #2a2a2a; --border-focus: #39ff14;
    --green: #39ff14; --green-dim: #1a7a08; --green-glow: rgba(57,255,20,0.12);
    --amber: #ffb300; --red: #ff4444; --text: #cccccc; --muted: #555; --white: #f0f0f0;
  }

  .term-root {
    min-height: 100vh; background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    position: relative; overflow: hidden; padding: 32px 16px;
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
    display: flex; align-items: center; gap: 8px;
    padding: 11px 16px; background: #131313;
    border-bottom: 1px solid var(--border); border-radius: 8px 8px 0 0; user-select: none;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot-red { background: #ff5f57; } .dot-yellow { background: #febc2e; } .dot-green-dot { background: #28c840; }
  .titlebar-title { flex: 1; text-align: center; font-size: 11px; color: var(--muted); letter-spacing: 0.06em; }
  .term-log { padding: 20px 22px 0; max-height: 200px; overflow: hidden; }
  .log-line { font-size: 12px; line-height: 1.9; white-space: pre; }
  .c-green { color: var(--green); } .c-muted { color: var(--muted); }
  .c-amber { color: var(--amber); } .c-red { color: var(--red); }
  .c-white { color: var(--white); } .c-dim { color: #252525; }
  .term-sep { border: none; border-top: 1px solid #1c1c1c; margin: 18px 0 0; }
  .term-form { padding: 22px; }
  .field-label { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 11px; color: var(--muted); letter-spacing: 0.08em; }
  .label-prefix { color: var(--green-dim); } .label-hint { margin-left: auto; font-size: 10px; color: #2e2e2e; }
  .label-req { color: var(--red); font-size: 10px; }
  .field-wrap { position: relative; margin-bottom: 16px; }
  .field-input {
    width: 100%; padding: 11px 42px 11px 14px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 4px; color: var(--white);
    font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; letter-spacing: 0.02em;
  }
  .field-input:focus { border-color: var(--border-focus); background: #111; box-shadow: 0 0 0 3px rgba(57,255,20,0.07), inset 0 0 12px rgba(57,255,20,0.02); }
  .field-input::placeholder { color: #333; }
  .field-input.is-error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(255,68,68,0.07); }
  .field-input.is-valid { border-color: var(--green-dim); }
  .field-input.has-toggle { padding-right: 52px; }
  .toggle-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em;
    padding: 3px 5px; border-radius: 2px; transition: color 0.15s, background 0.15s; text-transform: uppercase;
  }
  .toggle-btn:hover { color: var(--green); background: rgba(57,255,20,0.06); }
  .field-error { font-size: 11px; color: var(--red); margin-top: -10px; margin-bottom: 14px; padding-left: 2px; }
  .submit-btn {
    width: 100%; padding: 12px; background: var(--green);
    border: none; border-radius: 4px; color: #060606;
    font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    text-transform: uppercase; margin-top: 4px;
  }
  .submit-btn:hover:not(:disabled) { background: #52ff2e; box-shadow: 0 0 20px rgba(57,255,20,0.3); transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .spinner {
    width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.2); border-top-color: #000;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-banner {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px; background: rgba(255,68,68,0.06);
    border: 1px solid rgba(255,68,68,0.2); border-radius: 4px;
    margin-bottom: 16px; font-size: 12px; color: var(--red); letter-spacing: 0.03em;
  }
  .form-footer {
    display: flex; justify-content: space-between;
    margin-top: 14px; padding-top: 14px; border-top: 1px solid #1a1a1a;
    font-size: 11px; color: #2e2e2e;
  }
  .form-footer button {
    background: none; border: none; color: #333; font-family: 'JetBrains Mono', monospace;
    font-size: 11px; cursor: pointer; padding: 0; letter-spacing: 0.04em; transition: color 0.15s;
  }
  .form-footer button:hover { color: var(--green); }
  .register-hint { margin-top: 12px; text-align: center; font-size: 11px; color: #2e2e2e; letter-spacing: 0.04em; }
  .footer-link-green {
    background: none; border: none; color: var(--green-dim);
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    cursor: pointer; padding: 0; letter-spacing: 0.04em; transition: color 0.15s;
  }
  .footer-link-green:hover { color: var(--green); }
  .term-hint { padding: 10px 22px 14px; font-size: 10px; color: #222; border-top: 1px solid #161616; letter-spacing: 0.04em; }
  .boot-loader { padding: 20px 22px; }
  .progress-wrap { height: 2px; background: #1a1a1a; border-radius: 1px; margin-top: 10px; }
  .progress-bar { height: 100%; background: var(--green); box-shadow: 0 0 8px rgba(57,255,20,0.5); transition: width 0.35s ease; }
  .blink-cursor { display: inline-block; width: 8px; height: 13px; background: var(--green); animation: blink 1s step-end infinite; vertical-align: text-bottom; }
  @keyframes blink { 50% { opacity: 0; } }
  .step-bar { display: flex; align-items: center; margin-bottom: 20px; }
  .step-item { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--muted); letter-spacing: 0.06em; flex: 1; }
  .step-item.active { color: var(--green); }
  .step-item.done { color: var(--green-dim); }
  .step-num { width: 20px; height: 20px; border-radius: 2px; border: 1px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
  .step-item.active .step-num { background: var(--green); border-color: var(--green); color: #060606; font-weight: 700; }
  .step-item.done .step-num { background: var(--green-dim); border-color: var(--green-dim); color: #060606; }
  .step-connector { width: 28px; height: 1px; background: #222; margin: 0 6px; flex-shrink: 0; }
  .step-connector.done { background: var(--green-dim); }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .id-info { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; background: rgba(255,179,0,0.04); border: 1px solid rgba(255,179,0,0.12); border-radius: 4px; margin-bottom: 14px; font-size: 11px; color: #555; line-height: 1.6; letter-spacing: 0.03em; }
  .id-info-icon { color: var(--amber); flex-shrink: 0; margin-top: 1px; }
  .strength-wrap { margin-top: -10px; margin-bottom: 14px; }
  .strength-bar-bg { height: 3px; background: #1a1a1a; border-radius: 2px; margin-bottom: 6px; overflow: hidden; }
  .strength-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
  .strength-label { font-size: 10px; letter-spacing: 0.05em; }
  .btn-row { display: flex; gap: 10px; margin-top: 4px; }
  .btn-next { flex: 1; padding: 12px; background: var(--green); border: none; border-radius: 4px; color: #060606; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s; text-transform: uppercase; }
  .btn-next:hover:not(:disabled) { background: #52ff2e; box-shadow: 0 0 20px rgba(57,255,20,0.3); transform: translateY(-1px); }
  .btn-next:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-back { padding: 12px 16px; background: transparent; border: 1px solid var(--border); border-radius: 4px; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer; letter-spacing: 0.06em; transition: border-color 0.15s, color 0.15s; }
  .btn-back:hover { border-color: var(--muted); color: var(--white); }
  .success-body { padding: 32px 22px; text-align: center; }
  .success-icon { font-size: 32px; color: var(--green); margin-bottom: 14px; }
  .success-title { font-size: 14px; color: var(--green); letter-spacing: 0.06em; margin-bottom: 12px; }
  .success-sub { font-size: 12px; color: var(--muted); line-height: 1.8; letter-spacing: 0.03em; }
`;

// ─── FRIENDLY STYLES ─────────────────────────────────────────────────────────

const friendlyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

  .f-root[data-theme="dark"] {
    --fbg: #111827; --fcard: #1f2937; --fcard2: #243044; --fsurf: #283548;
    --fborder: #374151; --fborder-focus: #60a5fa;
    --facc: #3b82f6; --facc-hover: #2563eb; --facc-glow: rgba(59,130,246,0.25);
    --fgreen: #10b981; --fred: #ef4444; --fyellow: #f59e0b;
    --ftext: #f9fafb; --ftext2: #9ca3af; --ftext3: #6b7280;
    --fmuted: #4b5563; --fshadow: rgba(0,0,0,0.5); --fgrid: rgba(59,130,246,0.03);
  }

  .f-root[data-theme="light"] {
    --fbg: #f0f4ff; --fcard: #ffffff; --fcard2: #f8faff; --fsurf: #eef2ff;
    --fborder: #c7d2fe; --fborder-focus: #3b82f6;
    --facc: #3b82f6; --facc-hover: #2563eb; --facc-glow: rgba(59,130,246,0.2);
    --fgreen: #10b981; --fred: #ef4444; --fyellow: #f59e0b;
    --ftext: #111827; --ftext2: #374151; --ftext3: #6b7280;
    --fmuted: #9ca3af; --fshadow: rgba(59,130,246,0.12); --fgrid: rgba(59,130,246,0.04);
  }

  .f-root {
    min-height: 100vh; background: var(--fbg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Nunito', sans-serif;
    position: relative; overflow: hidden; padding: 32px 16px;
    transition: background 0.3s;
  }
  .f-root::before {
    content: ''; position: fixed; inset: 0;
    background-image: linear-gradient(var(--fgrid) 1px, transparent 1px), linear-gradient(90deg, var(--fgrid) 1px, transparent 1px);
    background-size: 40px 40px; pointer-events: none; z-index: 0;
  }
  .f-blob { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.25; pointer-events: none; z-index: 0; }
  .f-blob-1 { width: 500px; height: 500px; top: -150px; left: -150px; background: radial-gradient(circle, #3b82f6, transparent 70%); }
  .f-blob-2 { width: 400px; height: 400px; bottom: -100px; right: -100px; background: radial-gradient(circle, #8b5cf6, transparent 70%); }

  .f-card {
    width: 460px; max-width: 100%; background: var(--fcard);
    border: 1px solid var(--fborder); border-radius: 20px;
    box-shadow: 0 20px 60px var(--fshadow), 0 0 0 1px rgba(255,255,255,0.04);
    animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(20px) scale(0.98);
    position: relative; z-index: 10;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
  }
  @keyframes cardIn { to { opacity: 1; transform: translateY(0) scale(1); } }

  .f-header {
    padding: 28px 28px 24px; border-bottom: 1px solid var(--fborder);
    background: var(--fcard2); border-radius: 20px 20px 0 0;
    transition: background 0.3s, border-color 0.3s;
  }
  .f-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .f-logo-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, var(--facc), #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px var(--facc-glow); font-size: 18px; flex-shrink: 0;
  }
  .f-logo-text { font-weight: 800; font-size: 15px; color: var(--ftext); letter-spacing: -0.01em; line-height: 1.2; }
  .f-logo-sub { font-size: 11px; color: var(--ftext3); font-weight: 500; }
  .f-title { font-size: 22px; font-weight: 800; color: var(--ftext); letter-spacing: -0.02em; margin-bottom: 4px; }
  .f-subtitle { font-size: 13px; color: var(--ftext2); font-weight: 500; }

  .f-body { padding: 24px 28px 28px; }

  .f-field { margin-bottom: 18px; }
  .f-label { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--ftext2); margin-bottom: 8px; letter-spacing: 0.01em; }
  .f-label-hint { font-weight: 500; font-size: 11px; color: var(--ftext3); }

  .f-input-wrap { position: relative; }
  .f-input {
    width: 100%; padding: 13px 46px 13px 16px;
    background: var(--fsurf); border: 1.5px solid var(--fborder);
    border-radius: 12px; color: var(--ftext);
    font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 500;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .f-input:focus { border-color: var(--fborder-focus); box-shadow: 0 0 0 3px var(--facc-glow); }
  .f-input::placeholder { color: var(--fmuted); }
  .f-input.is-error { border-color: var(--fred); box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
  .f-input.is-valid { border-color: var(--fgreen); }
  .f-input.no-right-pad { padding-right: 16px; }
  .f-input-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--ftext3); font-size: 16px; pointer-events: none; line-height: 1; }
  .f-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--ftext3); cursor: pointer; padding: 4px; border-radius: 6px; font-size: 15px; line-height: 1; transition: color 0.15s, background 0.15s; }
  .f-toggle:hover { color: var(--facc); background: var(--facc-glow); }
  .f-field-err { font-size: 12px; color: var(--fred); margin-top: 6px; font-weight: 600; display: flex; align-items: center; gap: 4px; }

  .f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .f-info { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; margin-bottom: 16px; font-size: 12.5px; color: var(--ftext2); line-height: 1.6; font-weight: 500; }
  .f-info-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

  .f-error-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; margin-bottom: 16px; font-size: 13px; color: var(--fred); font-weight: 600; }

  .f-strength { margin-top: 8px; }
  .f-strength-bars { display: flex; gap: 4px; margin-bottom: 5px; }
  .f-strength-seg { flex: 1; height: 4px; border-radius: 2px; background: var(--fsurf); transition: background 0.3s; }
  .f-strength-label { font-size: 11px; font-weight: 700; }

  .f-steps { display: flex; align-items: center; margin-bottom: 24px; }
  .f-step { display: flex; align-items: center; gap: 8px; flex: 1; font-size: 13px; font-weight: 700; color: var(--fmuted); }
  .f-step.active { color: var(--facc); }
  .f-step.done { color: var(--fgreen); }
  .f-step-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; transition: all 0.2s; }
  .f-step.active .f-step-circle { background: var(--facc); border-color: var(--facc); color: #fff; box-shadow: 0 0 0 4px var(--facc-glow); }
  .f-step.done .f-step-circle { background: var(--fgreen); border-color: var(--fgreen); color: #fff; }
  .f-step-line { flex: 1; height: 2px; background: var(--fborder); margin: 0 8px; max-width: 40px; transition: background 0.3s; }
  .f-step-line.done { background: var(--fgreen); }

  .f-btn { width: 100%; padding: 14px; background: var(--facc); border: none; border-radius: 12px; color: #fff; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 0.01em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s; margin-top: 4px; }
  .f-btn:hover:not(:disabled) { background: var(--facc-hover); box-shadow: 0 4px 20px var(--facc-glow); transform: translateY(-1px); }
  .f-btn:active:not(:disabled) { transform: translateY(0); }
  .f-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .f-btn-row { display: flex; gap: 10px; margin-top: 4px; }
  .f-btn-back { padding: 14px 18px; background: transparent; border: 1.5px solid var(--fborder); border-radius: 12px; color: var(--ftext2); font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; }
  .f-btn-back:hover { border-color: var(--fborder-focus); color: var(--ftext); background: var(--fsurf); }
  .f-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; display: inline-block; margin-right: 8px; vertical-align: middle; }

  .f-footer { padding: 16px 28px 20px; border-top: 1px solid var(--fborder); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: var(--ftext3); font-weight: 500; transition: border-color 0.3s; }
  .f-link { background: none; border: none; color: var(--facc); font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; padding: 0; transition: color 0.15s; text-decoration: underline; text-underline-offset: 2px; }
  .f-link:hover { color: var(--facc-hover); }
  .f-demo { text-align: center; font-size: 11px; color: var(--fmuted); margin-top: 12px; font-weight: 500; }

  .f-success { padding: 40px 28px; text-align: center; }
  .f-success-icon { font-size: 52px; margin-bottom: 16px; }
  .f-success-title { font-size: 22px; font-weight: 800; color: var(--ftext); margin-bottom: 8px; }
  .f-success-sub { font-size: 14px; color: var(--ftext2); line-height: 1.7; font-weight: 500; }

  .f-loading { padding: 40px 28px; text-align: center; }
  .f-loading-ring { width: 56px; height: 56px; border-radius: 50%; border: 3px solid var(--fborder); border-top-color: var(--facc); animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  .f-loading-title { font-size: 16px; font-weight: 700; color: var(--ftext); margin-bottom: 6px; }
  .f-loading-sub { font-size: 13px; color: var(--ftext3); font-weight: 500; }
`;

// ─── TOGGLE STYLES ────────────────────────────────────────────────────────────

const toggleStyles = `
  .mode-toggle {
    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
    display: flex; align-items: center; gap: 8px;
    padding: 7px 12px 7px 10px;
    background: rgba(20,20,20,0.88); backdrop-filter: blur(12px);
    border: 1px solid #2a2a2a; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: #555; cursor: pointer; letter-spacing: 0.05em;
    transition: all 0.2s; user-select: none; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .mode-toggle:hover { border-color: #39ff14; color: #39ff14; box-shadow: 0 4px 20px rgba(57,255,20,0.1); }
  .mode-toggle.friendly-mode {
    background: rgba(255,255,255,0.9); border-color: #c7d2fe; color: #6b7280;
    font-family: 'Nunito', sans-serif; font-weight: 700; box-shadow: 0 4px 20px rgba(59,130,246,0.1);
  }
  .mode-toggle.friendly-mode:hover { border-color: #3b82f6; color: #3b82f6; box-shadow: 0 4px 20px rgba(59,130,246,0.2); }
  .mode-toggle-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  .theme-toggle {
    position: fixed; bottom: 20px; left: 20px; z-index: 9999;
    display: flex; align-items: center; gap: 6px; padding: 7px 14px;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    border: 1px solid #c7d2fe; border-radius: 20px;
    font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700;
    color: #6b7280; cursor: pointer; letter-spacing: 0.01em;
    transition: all 0.2s; user-select: none; box-shadow: 0 4px 20px rgba(59,130,246,0.1);
  }
  .theme-toggle:hover { border-color: #3b82f6; color: #3b82f6; }
  .theme-toggle.dark-mode { background: rgba(17,24,39,0.9); border-color: #374151; color: #9ca3af; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .theme-toggle.dark-mode:hover { border-color: #60a5fa; color: #60a5fa; }
`;

// ─── SHARED UTILS ─────────────────────────────────────────────────────────────

function getStrength(pw) {
  if (!pw) return { score: 0, label: "—", color: "#444", width: "0%" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too short",  color: "#ef4444", width: "15%" },
    { label: "Weak",       color: "#f97316", width: "35%" },
    { label: "Fair",       color: "#f59e0b", width: "60%" },
    { label: "Strong",     color: "#10b981", width: "80%" },
    { label: "Excellent",  color: "#3b82f6", width: "100%" },
  ];
  return { score: s, ...map[s] };
}

// ─── TERMINAL BOOT LOADER ─────────────────────────────────────────────────────

function TermBootLoader({ onDone }) {
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

// ─── TERMINAL LOGIN ───────────────────────────────────────────────────────────

function TerminalLogin({ onLogin, onGoToRegister }) {
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
    if (email === DEMO.email && password === DEMO.password) {
      setLoading(false); setPhase("success");
    } else {
      setLoading(false); setPhase("form");
      setError("ERROR: Access denied. Invalid credentials. [AUTH_FAIL_403]");
    }
  };

  return (
    <div className="term-root">
      <div className="terminal">
        <div className="titlebar">
          <div className="dot dot-red" /><div className="dot dot-yellow" /><div className="dot dot-green-dot" />
          <span className="titlebar-title">sentinel@monitor: ~ — bash</span>
        </div>
        <div className="term-log">
          {BOOT_LINES.slice(0, bootVisible).map((l, i) => (
            <div key={i} className={`log-line ${l.cls}`}>{l.text}</div>
          ))}
        </div>
        <hr className="term-sep" />
        {phase === "success" ? (
          <TermBootLoader onDone={onLogin} />
        ) : (
          <div className="term-form">
            {error && (
              <div className="error-banner">
                <span style={{ color: "var(--red)", fontSize: "13px" }}>✕</span>
                <span>{error}</span>
              </div>
            )}
            <div className="field-label">
              <span className="label-prefix">//</span><span>identifier</span>
              <span className="label-hint">your login email</span>
            </div>
            <div className="field-wrap">
              <input ref={emailRef} className={`field-input${error && !email ? " is-error" : ""}`}
                type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="user@domain.io" autoComplete="email" spellCheck={false}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} disabled={loading} />
            </div>
            <div className="field-label">
              <span className="label-prefix">//</span><span>access key</span>
              <span className="label-hint">your password</span>
            </div>
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
              {loading ? (
                <span className="btn-inner"><span className="spinner" /> Authenticating...</span>
              ) : (
                <span className="btn-inner">$ ./authenticate.sh</span>
              )}
            </button>
            <div className="form-footer">
              <button>forgot access key?</button>
              <button onClick={onGoToRegister}>./register</button>
            </div>
            <div className="register-hint">
              no account yet?{" "}
              <button className="footer-link-green" onClick={onGoToRegister}>create one here</button>
            </div>
          </div>
        )}
        <div className="term-hint">demo → {DEMO.email} / {DEMO.password}</div>
      </div>
    </div>
  );
}

// ─── TERMINAL REGISTER ────────────────────────────────────────────────────────

function TerminalRegister({ onRegister, onGoToLogin }) {
  const BOOT = [
    { text: "SITE-SENTINEL — New User Provisioning",  cls: "c-green", delay: 0 },
    { text: "[ OK ] Enrollment portal open.",         cls: "c-muted", delay: 250 },
    { text: "  Complete all fields to register.",     cls: "c-white", delay: 480 },
  ];
  const [bootVisible, setBootVisible] = useState(0);
  const [step, setStep]               = useState(1);
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [studentId, setStudentId]     = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [phase, setPhase]             = useState("form");
  const firstRef = useRef(null); const emailRef = useRef(null);

  useEffect(() => {
    BOOT.forEach((l, i) => setTimeout(() => setBootVisible(i + 1), l.delay));
    setTimeout(() => firstRef.current?.focus(), BOOT[BOOT.length - 1].delay + 200);
  }, []);

  const clearErr = k => setErrors(e => ({ ...e, [k]: "" }));
  const booted = bootVisible >= BOOT.length;
  const strength = getStrength(password);

  const handleNext = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim())  e.lastName  = "Last name is required.";
    if (!studentId.trim()) e.studentId = "Student ID is required.";
    else if (!/^[\w-]{4,15}$/.test(studentId)) e.studentId = "Invalid ID format.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2); setTimeout(() => emailRef.current?.focus(), 50);
  };

  const handleSubmit = async () => {
    const e = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required.";
    if (!password || password.length < 8) e.password = "Password must be 8+ characters.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false); setPhase("success");
    setTimeout(() => onRegister?.(), 3500);
  };

  return (
    <div className="term-root">
      <div className="terminal">
        <div className="titlebar">
          <div className="dot dot-red" /><div className="dot dot-yellow" /><div className="dot dot-green-dot" />
          <span className="titlebar-title">sentinel@monitor: ~ — register</span>
        </div>
        <div className="term-log">
          {BOOT.slice(0, bootVisible).map((l, i) => (
            <div key={i} className={`log-line ${l.cls}`}>{l.text}</div>
          ))}
        </div>
        <hr className="term-sep" />
        {phase === "success" ? (
          <div className="success-body">
            <div className="success-icon">✦</div>
            <div className="success-title">[ OK ] Account created successfully.</div>
            <div className="success-sub">
              Welcome aboard, <span style={{ color: "var(--green)" }}>{firstName} {lastName}</span>.<br />
              Your account is pending admin approval.<br />
              You will be notified once access is granted.
            </div>
            <div style={{ marginTop: "16px", fontSize: "10px", color: "#252525" }}>Redirecting to login...</div>
          </div>
        ) : (
          <div className="term-form">
            {booted && (
              <div className="step-bar">
                <div className={`step-item ${step === 1 ? "active" : "done"}`}>
                  <div className="step-num">{step > 1 ? "✓" : "1"}</div><span>personal info</span>
                </div>
                <div className={`step-connector ${step > 1 ? "done" : ""}`} />
                <div className={`step-item ${step === 2 ? "active" : ""}`}>
                  <div className="step-num">2</div><span>credentials</span>
                </div>
              </div>
            )}
            {step === 1 && (
              <>
                <div className="field-row">
                  <div>
                    <div className="field-label"><span className="label-prefix">//</span><span>first name</span><span className="label-req">*</span></div>
                    <div className="field-wrap">
                      <input ref={firstRef} className={`field-input${errors.firstName ? " is-error" : firstName ? " is-valid" : ""}`}
                        type="text" value={firstName} onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
                        placeholder="Juan" onKeyDown={e => e.key === "Enter" && handleNext()} />
                    </div>
                    {errors.firstName && <div className="field-error">⚠ {errors.firstName}</div>}
                  </div>
                  <div>
                    <div className="field-label"><span className="label-prefix">//</span><span>last name</span><span className="label-req">*</span></div>
                    <div className="field-wrap">
                      <input className={`field-input${errors.lastName ? " is-error" : lastName ? " is-valid" : ""}`}
                        type="text" value={lastName} onChange={e => { setLastName(e.target.value); clearErr("lastName"); }}
                        placeholder="dela Cruz" onKeyDown={e => e.key === "Enter" && handleNext()} />
                    </div>
                    {errors.lastName && <div className="field-error">⚠ {errors.lastName}</div>}
                  </div>
                </div>
                <div className="field-label"><span className="label-prefix">//</span><span>student id</span><span className="label-req">*</span><span className="label-hint">from your school ID</span></div>
                <div className="id-info"><span className="id-info-icon">ℹ</span><span>Your Student ID verifies your role as a sit-in monitoring staff member. Enter it exactly as shown on your school-issued ID.</span></div>
                <div className="field-wrap">
                  <input className={`field-input${errors.studentId ? " is-error" : studentId ? " is-valid" : ""}`}
                    type="text" value={studentId} onChange={e => { setStudentId(e.target.value); clearErr("studentId"); }}
                    placeholder="e.g. 2021-00123" onKeyDown={e => e.key === "Enter" && handleNext()} maxLength={15} />
                </div>
                {errors.studentId && <div className="field-error">⚠ {errors.studentId}</div>}
                <div className="btn-row">
                  <button className="btn-next" onClick={handleNext}><span className="btn-inner">$ next --step 2 →</span></button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="field-label"><span className="label-prefix">//</span><span>email address</span><span className="label-req">*</span></div>
                <div className="field-wrap">
                  <input ref={emailRef} className={`field-input${errors.email ? " is-error" : email ? " is-valid" : ""}`}
                    type="email" value={email} onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                    placeholder="juan@school.edu.ph" autoComplete="email" />
                </div>
                {errors.email && <div className="field-error">⚠ {errors.email}</div>}
                <div className="field-label"><span className="label-prefix">//</span><span>password</span><span className="label-req">*</span><span className="label-hint">min. 8 characters</span></div>
                <div className="field-wrap">
                  <input className={`field-input has-toggle${errors.password ? " is-error" : password && strength.score >= 2 ? " is-valid" : ""}`}
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                    placeholder="create a strong password" autoComplete="new-password" />
                  <button className="toggle-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? "hide" : "show"}
                  </button>
                </div>
                {errors.password && <div className="field-error">⚠ {errors.password}</div>}
                {password && (
                  <div className="strength-wrap">
                    <div className="strength-bar-bg"><div className="strength-bar-fill" style={{ width: strength.width, background: strength.color }} /></div>
                    <span className="strength-label" style={{ color: strength.color }}>{`// strength: ${strength.label}`}</span>
                  </div>
                )}
                <div className="btn-row">
                  <button className="btn-back" onClick={() => setStep(1)}>← back</button>
                  <button className="btn-next" onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className="btn-inner"><span className="spinner" /> Creating account...</span>
                             : <span className="btn-inner">$ ./register.sh ✓</span>}
                  </button>
                </div>
              </>
            )}
            <div className="form-footer" style={{ justifyContent: "center" }}>
              Already have an account?{" "}
              <button onClick={onGoToLogin} style={{ marginLeft: 6 }}>$ login --existing</button>
            </div>
          </div>
        )}
        <div className="term-hint">* all fields are required</div>
      </div>
    </div>
  );
}

// ─── FRIENDLY LOGIN ───────────────────────────────────────────────────────────

function FriendlyLogin({ onLogin, onGoToRegister, theme }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    if (email === DEMO.email && password === DEMO.password) {
      setSuccess(true);
      setTimeout(() => onLogin?.(), 2000);
    } else {
      setLoading(false);
      setError("Incorrect email or password. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="f-root" data-theme={theme}>
        <div className="f-blob f-blob-1" /><div className="f-blob f-blob-2" />
        <div className="f-card">
          <div className="f-loading">
            <div className="f-loading-ring" />
            <div className="f-loading-title">Welcome back!</div>
            <div className="f-loading-sub">Taking you to your dashboard…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="f-root" data-theme={theme}>
      <div className="f-blob f-blob-1" /><div className="f-blob f-blob-2" />
      <div className="f-card">
        <div className="f-header">
          <div className="f-logo">
            <div className="f-logo-icon">🛡️</div>
            <div>
              <div className="f-logo-text">Site Sentinel</div>
              <div className="f-logo-sub">Sit-in Monitoring System</div>
            </div>
          </div>
          <div className="f-title">Welcome back</div>
          <div className="f-subtitle">Sign in to access the monitoring dashboard</div>
        </div>
        <div className="f-body">
          {error && <div className="f-error-banner"><span>⚠️</span><span>{error}</span></div>}
          <div className="f-field">
            <div className="f-label">Email Address</div>
            <div className="f-input-wrap">
              <input className={`f-input${error ? " is-error" : email ? " is-valid" : ""}`}
                type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@school.edu.ph" autoComplete="email" disabled={loading}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <span className="f-input-icon">✉️</span>
            </div>
          </div>
          <div className="f-field">
            <div className="f-label">
              Password
              <span className="f-label-hint"><button className="f-link" style={{ fontSize: 11 }}>Forgot password?</button></span>
            </div>
            <div className="f-input-wrap">
              <input className={`f-input${error ? " is-error" : ""}`}
                type={showPass ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password" autoComplete="current-password" disabled={loading}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <button className="f-toggle" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button className="f-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="f-spinner" />Signing in…</> : "Sign In →"}
          </button>
          <div className="f-demo">Demo: {DEMO.email} / {DEMO.password}</div>
        </div>
        <div className="f-footer">
          <span>Don't have an account yet?</span>
          <button className="f-link" onClick={onGoToRegister}>Create one</button>
        </div>
      </div>
    </div>
  );
}

// ─── FRIENDLY REGISTER ────────────────────────────────────────────────────────

function FriendlyRegister({ onRegister, onGoToLogin, theme }) {
  const [step, setStep]           = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const clearErr = k => setErrors(e => ({ ...e, [k]: "" }));
  const strength = getStrength(password);

  const handleNext = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim())  e.lastName  = "Last name is required.";
    if (!studentId.trim()) e.studentId = "Student ID is required.";
    else if (!/^[\w-]{4,15}$/.test(studentId)) e.studentId = "Invalid format (e.g. 2021-00123)";
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2);
  };

  const handleSubmit = async () => {
    const e = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Please enter a valid email.";
    if (!password || password.length < 8) e.password = "Password must be at least 8 characters.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false); setSuccess(true);
    setTimeout(() => onRegister?.(), 3500);
  };

  if (success) {
    return (
      <div className="f-root" data-theme={theme}>
        <div className="f-blob f-blob-1" /><div className="f-blob f-blob-2" />
        <div className="f-card">
          <div className="f-success">
            <div className="f-success-icon">🎉</div>
            <div className="f-success-title">Account Created!</div>
            <div className="f-success-sub">
              Welcome, <strong>{firstName} {lastName}</strong>!<br />
              Your account is pending admin approval.<br />
              You'll be notified once access is granted.
            </div>
          </div>
          <div className="f-footer">
            <button className="f-link" onClick={onGoToLogin}>Back to Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="f-root" data-theme={theme}>
      <div className="f-blob f-blob-1" /><div className="f-blob f-blob-2" />
      <div className="f-card">
        <div className="f-header">
          <div className="f-logo">
            <div className="f-logo-icon">🛡️</div>
            <div>
              <div className="f-logo-text">Site Sentinel</div>
              <div className="f-logo-sub">Sit-in Monitoring System</div>
            </div>
          </div>
          <div className="f-title">Create your account</div>
          <div className="f-subtitle">Register as a sit-in monitoring staff member</div>
        </div>
        <div className="f-body">
          <div className="f-steps">
            <div className={`f-step ${step === 1 ? "active" : "done"}`}>
              <div className="f-step-circle">{step > 1 ? "✓" : "1"}</div>
              <span>Personal Info</span>
            </div>
            <div className={`f-step-line ${step > 1 ? "done" : ""}`} />
            <div className={`f-step ${step === 2 ? "active" : ""}`}>
              <div className="f-step-circle">2</div>
              <span>Account Setup</span>
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="f-row">
                <div className="f-field">
                  <div className="f-label">First Name</div>
                  <div className="f-input-wrap">
                    <input className={`f-input no-right-pad${errors.firstName ? " is-error" : firstName ? " is-valid" : ""}`}
                      type="text" value={firstName} onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
                      placeholder="Juan" onKeyDown={e => e.key === "Enter" && handleNext()} />
                  </div>
                  {errors.firstName && <div className="f-field-err">⚠ {errors.firstName}</div>}
                </div>
                <div className="f-field">
                  <div className="f-label">Last Name</div>
                  <div className="f-input-wrap">
                    <input className={`f-input no-right-pad${errors.lastName ? " is-error" : lastName ? " is-valid" : ""}`}
                      type="text" value={lastName} onChange={e => { setLastName(e.target.value); clearErr("lastName"); }}
                      placeholder="dela Cruz" onKeyDown={e => e.key === "Enter" && handleNext()} />
                  </div>
                  {errors.lastName && <div className="f-field-err">⚠ {errors.lastName}</div>}
                </div>
              </div>
              <div className="f-field">
                <div className="f-label">Student ID</div>
                <div className="f-info">
                  <span className="f-info-icon">💡</span>
                  <span>Your Student ID verifies your role as a monitoring staff member. Enter it exactly as shown on your school-issued ID.</span>
                </div>
                <div className="f-input-wrap">
                  <input className={`f-input no-right-pad${errors.studentId ? " is-error" : studentId ? " is-valid" : ""}`}
                    type="text" value={studentId} onChange={e => { setStudentId(e.target.value); clearErr("studentId"); }}
                    placeholder="e.g. 2021-00123" maxLength={15} onKeyDown={e => e.key === "Enter" && handleNext()} />
                </div>
                {errors.studentId && <div className="f-field-err">⚠ {errors.studentId}</div>}
              </div>
              <button className="f-btn" onClick={handleNext}>Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="f-field">
                <div className="f-label">Email Address</div>
                <div className="f-input-wrap">
                  <input className={`f-input${errors.email ? " is-error" : email ? " is-valid" : ""}`}
                    type="email" value={email} onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                    placeholder="juan@school.edu.ph" autoComplete="email" />
                  <span className="f-input-icon">✉️</span>
                </div>
                {errors.email && <div className="f-field-err">⚠ {errors.email}</div>}
              </div>
              <div className="f-field">
                <div className="f-label">
                  Password <span className="f-label-hint">min. 8 characters</span>
                </div>
                <div className="f-input-wrap">
                  <input className={`f-input${errors.password ? " is-error" : password && strength.score >= 2 ? " is-valid" : ""}`}
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                    placeholder="Create a strong password" autoComplete="new-password" />
                  <button className="f-toggle" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <div className="f-field-err">⚠ {errors.password}</div>}
                {password && (
                  <div className="f-strength">
                    <div className="f-strength-bars">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="f-strength-seg"
                          style={{ background: i < strength.score ? strength.color : undefined }} />
                      ))}
                    </div>
                    <span className="f-strength-label" style={{ color: strength.color }}>
                      Strength: {strength.label}
                    </span>
                  </div>
                )}
              </div>
              <div className="f-btn-row">
                <button className="f-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="f-btn" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="f-spinner" />Creating account…</> : "Create Account ✓"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="f-footer">
          <span>Already have an account?</span>
          <button className="f-link" onClick={onGoToLogin}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]         = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [uiMode, setUiMode]     = useState("friendly"); // "terminal" | "friendly"
  const [theme, setTheme]       = useState("dark");     // "dark" | "light"

  const isFriendly = uiMode === "friendly";

  if (loggedIn) {
    return (
      <>
        <style>{terminalStyles}</style>
        <style>{friendlyStyles}</style>
        <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", color: "#f1f5f9" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Dashboard coming soon!</h1>
            <p style={{ color: "#94a3b8", fontSize: 15 }}>You're successfully signed in to Site Sentinel.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{terminalStyles}</style>
      <style>{friendlyStyles}</style>
      <style>{toggleStyles}</style>

      {/* ── UI MODE TOGGLE — bottom-right corner (subtle) ── */}
      <button
        className={`mode-toggle${isFriendly ? " friendly-mode" : ""}`}
        onClick={() => setUiMode(m => m === "terminal" ? "friendly" : "terminal")}
        title={isFriendly ? "Switch to Terminal UI" : "Switch to Friendly UI"}
      >
        <span className="mode-toggle-dot" />
        {isFriendly ? "Terminal UI" : "Friendly UI"}
      </button>

      {/* ── LIGHT / DARK TOGGLE — bottom-left, friendly mode only ── */}
      {isFriendly && (
        <button
          className={`theme-toggle${theme === "dark" ? " dark-mode" : ""}`}
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
        </button>
      )}

      {/* ── ACTIVE UI ── */}
      {isFriendly ? (
        page === "register"
          ? <FriendlyRegister onRegister={() => setLoggedIn(true)} onGoToLogin={() => setPage("login")} theme={theme} />
          : <FriendlyLogin    onLogin={() => setLoggedIn(true)}    onGoToRegister={() => setPage("register")} theme={theme} />
      ) : (
        page === "register"
          ? <TerminalRegister onRegister={() => setLoggedIn(true)} onGoToLogin={() => setPage("login")} />
          : <TerminalLogin    onLogin={() => setLoggedIn(true)}    onGoToRegister={() => setPage("register")} />
      )}
    </>
  );
}