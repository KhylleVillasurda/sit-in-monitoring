import { useState, useEffect, useRef } from "react";

// ─── TERMINAL STYLES (original) ────────────────────────────────────────────
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
    font-family: 'JetBrains Mono', monospace;
    position: relative; overflow: hidden; padding: 32px 16px;
  }
  .term-root::before {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
    pointer-events: none; z-index: 100;
  }
  .terminal {
    width: 600px; background: var(--terminal); border: 1px solid var(--border); border-radius: 8px;
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
  .term-log { padding: 18px 22px 0; }
  .log-line { font-size: 12px; line-height: 1.9; white-space: pre; }
  .c-green { color: var(--green); } .c-muted { color: var(--muted); } .c-white { color: var(--white); }
  .term-sep { border: none; border-top: 1px solid #1c1c1c; margin: 16px 0 0; }
  .term-form { padding: 20px 22px 22px; }
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
  .field-label { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; font-size: 11px; color: var(--muted); letter-spacing: 0.07em; }
  .label-prefix { color: var(--green-dim); }
  .label-hint { margin-left: auto; font-size: 10px; color: #282828; }
  .label-req { color: var(--red); font-size: 10px; }
  .field-wrap { position: relative; margin-bottom: 14px; }
  .field-input { width: 100%; padding: 11px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--white); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .field-input:focus { border-color: var(--border-focus); background: #111; box-shadow: 0 0 0 3px rgba(57,255,20,0.07); }
  .field-input::placeholder { color: #2e2e2e; }
  .field-input.is-error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(255,68,68,0.07); }
  .field-input.is-valid { border-color: var(--green-dim); }
  .field-input.has-toggle { padding-right: 52px; }
  .toggle-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.05em; padding: 3px 5px; border-radius: 2px; text-transform: uppercase; transition: color 0.15s, background 0.15s; }
  .toggle-btn:hover { color: var(--green); background: rgba(57,255,20,0.06); }
  .field-err { font-size: 10px; color: var(--red); margin-top: -10px; margin-bottom: 12px; padding-left: 2px; letter-spacing: 0.03em; }
  .id-info { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; background: rgba(255,179,0,0.04); border: 1px solid rgba(255,179,0,0.12); border-radius: 4px; margin-bottom: 14px; font-size: 11px; color: #555; line-height: 1.6; letter-spacing: 0.03em; }
  .id-info-icon { color: var(--amber); flex-shrink: 0; margin-top: 1px; }
  .strength-wrap { margin-top: -10px; margin-bottom: 14px; }
  .strength-bar-bg { height: 2px; background: #1a1a1a; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
  .strength-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease, background 0.3s ease; }
  .strength-label { font-size: 10px; letter-spacing: 0.05em; }
  .error-banner { display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; background: rgba(255,68,68,0.06); border: 1px solid rgba(255,68,68,0.2); border-radius: 4px; margin-bottom: 16px; animation: shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97); font-size: 11px; color: var(--red); letter-spacing: 0.03em; line-height: 1.6; }
  @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  .btn-row { display: flex; gap: 10px; margin-top: 6px; }
  .btn-back { padding: 11px 18px; background: none; border: 1px solid #2a2a2a; border-radius: 4px; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer; letter-spacing: 0.06em; transition: border-color 0.15s, color 0.15s; white-space: nowrap; }
  .btn-back:hover { border-color: var(--muted); color: var(--text); }
  .btn-next { flex: 1; padding: 12px; background: var(--green); border: none; border-radius: 4px; color: #060606; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: background 0.15s, box-shadow 0.15s, transform 0.1s; }
  .btn-next:hover:not(:disabled) { background: #52ff2e; box-shadow: 0 0 20px rgba(57,255,20,0.3); transform: translateY(-1px); }
  .btn-next:active:not(:disabled) { transform: translateY(0); }
  .btn-next:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .spinner { width: 13px; height: 13px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #060606; border-radius: 50%; animation: spin 0.65s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .form-footer { margin-top: 16px; text-align: center; font-size: 11px; color: #2a2a2a; letter-spacing: 0.04em; }
  .form-footer button { background: none; border: none; color: var(--green-dim); font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: pointer; transition: color 0.15s; letter-spacing: 0.04em; padding: 0; }
  .form-footer button:hover { color: var(--green); }
  .success-body { padding: 32px 22px 28px; text-align: center; }
  .success-icon { font-size: 28px; color: var(--green); margin-bottom: 14px; animation: popIn 0.5s cubic-bezier(0.16,1,0.3,1); }
  @keyframes popIn { from{transform:scale(0.4);opacity:0} to{transform:scale(1);opacity:1} }
  .success-title { font-size: 14px; font-weight: 700; color: var(--green); letter-spacing: 0.08em; margin-bottom: 10px; }
  .success-sub { font-size: 11px; color: var(--muted); line-height: 1.8; letter-spacing: 0.04em; }
  .term-hint { padding: 10px 22px 14px; font-size: 10px; color: #1e1e1e; border-top: 1px solid #161616; letter-spacing: 0.04em; }
  .mode-toggle-btn { position: fixed; bottom: 18px; right: 18px; z-index: 9999; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; padding: 6px 10px; cursor: pointer; transition: all 0.2s; opacity: 0.5; }
  .mode-toggle-btn:hover { opacity: 1; border-color: var(--green); color: var(--green); }

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
`;

// ─── FRIENDLY STYLES ───────────────────────────────────────────────────────
const friendlyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }
  .f-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.4s, color 0.4s; position: relative; overflow: hidden; padding: 32px 24px; }
  .f-root.dark { background: #0e1117; color: #e2e8f0; }
  .f-root.dark::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 20% 30%, rgba(57,255,20,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(57,255,20,0.03) 0%, transparent 50%); pointer-events: none; }
  .f-root.light { background: #f0f4f8; color: #1a202c; }
  .f-root.light::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 20% 30%, rgba(57,200,20,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(57,200,20,0.04) 0%, transparent 50%); pointer-events: none; }
  .f-card { width: 100%; max-width: 460px; border-radius: 20px; animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; transform: translateY(20px); position: relative; z-index: 10; transition: background 0.4s, box-shadow 0.4s, border-color 0.4s; }
  .dark .f-card { background: #151b23; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(57,255,20,0.04); }
  .light .f-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.07); box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
  @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
  .f-header { padding: 28px 28px 0; }

  /* Logo row with images */
  .f-logo-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
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
  .dark .f-logo-text { color: #39ff14; } .light .f-logo-text { color: #1a7a08; }
  .f-logo-subtext { font-size: 10px; font-weight: 500; letter-spacing: 0.04em; }
  .dark .f-logo-subtext { color: #475569; } .light .f-logo-subtext { color: #94a3b8; }

  .f-title { font-size: 20px; font-weight: 700; line-height: 1.2; margin-bottom: 4px; }
  .dark .f-title { color: #f1f5f9; } .light .f-title { color: #0f172a; }
  .f-subtitle { font-size: 13px; color: #64748b; }

  /* Step indicator */
  .f-steps { display: flex; align-items: center; gap: 0; margin-bottom: 20px; }
  .f-step { display: flex; align-items: center; gap: 8px; flex: 1; }
  .f-step-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all 0.3s; border: 2px solid; }
  .dark .f-step-circle.pending { border-color: #2a3441; background: transparent; color: #3d4f63; }
  .dark .f-step-circle.active { border-color: #39ff14; background: rgba(57,255,20,0.1); color: #39ff14; }
  .dark .f-step-circle.done { border-color: #1a7a08; background: #1a7a08; color: #fff; }
  .light .f-step-circle.pending { border-color: #e2e8f0; background: transparent; color: #cbd5e1; }
  .light .f-step-circle.active { border-color: #16a34a; background: rgba(22,163,74,0.1); color: #16a34a; }
  .light .f-step-circle.done { border-color: #16a34a; background: #16a34a; color: #fff; }
  .f-step-label { font-size: 12px; font-weight: 600; }
  .dark .f-step-label.active { color: #39ff14; } .dark .f-step-label.done { color: #4ade80; } .dark .f-step-label.pending { color: #334155; }
  .light .f-step-label.active { color: #16a34a; } .light .f-step-label.done { color: #15803d; } .light .f-step-label.pending { color: #cbd5e1; }
  .f-step-connector { flex: 1; height: 2px; margin: 0 8px; border-radius: 2px; transition: background 0.3s; }
  .dark .f-step-connector.done { background: #1a7a08; } .dark .f-step-connector.pending { background: #1e2733; }
  .light .f-step-connector.done { background: #16a34a; } .light .f-step-connector.pending { background: #e2e8f0; }

  .f-body { padding: 22px 28px 28px; }
  .f-field { margin-bottom: 16px; }
  .f-label { display: block; font-size: 12.5px; font-weight: 600; margin-bottom: 6px; }
  .dark .f-label { color: #94a3b8; } .light .f-label { color: #374151; }
  .f-input-wrap { position: relative; }
  .f-input { width: 100%; padding: 11px 16px; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500; outline: none; transition: all 0.2s; }
  .dark .f-input { background: #1e2733; border: 1.5px solid #2a3441; color: #f1f5f9; }
  .dark .f-input::placeholder { color: #3d4f63; }
  .dark .f-input:focus { border-color: #39ff14; background: #1a2230; box-shadow: 0 0 0 3px rgba(57,255,20,0.08); }
  .light .f-input { background: #f8fafc; border: 1.5px solid #e2e8f0; color: #0f172a; }
  .light .f-input::placeholder { color: #94a3b8; }
  .light .f-input:focus { border-color: #22c55e; background: #fff; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .f-input.is-error { border-color: #f87171 !important; box-shadow: 0 0 0 3px rgba(248,113,113,0.1) !important; }
  .f-input.is-valid { border-color: #4ade80 !important; }
  .f-input.has-right { padding-right: 44px; }
  .f-eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; font-size: 15px; transition: opacity 0.15s; opacity: 0.5; }
  .f-eye-btn:hover { opacity: 1; }
  .f-error-msg { font-size: 12px; color: #f87171; margin-top: 5px; font-weight: 500; }
  .f-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* Info box */
  .f-info-box { display: flex; gap: 10px; padding: 11px 14px; border-radius: 10px; margin-bottom: 14px; font-size: 12.5px; line-height: 1.6; font-weight: 500; }
  .dark .f-info-box { background: rgba(255,179,0,0.05); border: 1px solid rgba(255,179,0,0.15); color: #92400e; }
  .light .f-info-box { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25); color: #92400e; }
  .dark .f-info-box { color: #a16207; }
  .f-info-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

  /* Strength bar */
  .f-strength-wrap { margin-top: 6px; }
  .f-strength-bg { height: 4px; background: #1e2733; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
  .light .f-strength-bg { background: #e2e8f0; }
  .f-strength-fill { height: 100%; border-radius: 4px; transition: width 0.3s, background 0.3s; }
  .f-strength-label { font-size: 11.5px; font-weight: 600; }

  /* Error banner */
  .f-error-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; font-weight: 500; line-height: 1.5; background: rgba(248,113,113,0.08); border: 1.5px solid rgba(248,113,113,0.25); color: #f87171; animation: shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }
  @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }

  /* Buttons */
  .f-btn-row { display: flex; gap: 10px; margin-top: 8px; }
  .f-btn-back { padding: 11px 18px; background: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .dark .f-btn-back { border: 1.5px solid #2a3441; color: #64748b; }
  .dark .f-btn-back:hover { border-color: #4a5568; color: #94a3b8; }
  .light .f-btn-back { border: 1.5px solid #e2e8f0; color: #94a3b8; }
  .light .f-btn-back:hover { border-color: #cbd5e1; color: #64748b; }
  .f-btn-next { flex: 1; padding: 12px; border: none; border-radius: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .dark .f-btn-next { background: #39ff14; color: #0a1000; }
  .dark .f-btn-next:hover:not(:disabled) { background: #52ff2e; box-shadow: 0 4px 20px rgba(57,255,20,0.35); transform: translateY(-1px); }
  .light .f-btn-next { background: #16a34a; color: #fff; }
  .light .f-btn-next:hover:not(:disabled) { background: #15803d; box-shadow: 0 4px 20px rgba(22,163,74,0.3); transform: translateY(-1px); }
  .f-btn-next:active:not(:disabled) { transform: translateY(0); }
  .f-btn-next:disabled { opacity: 0.45; cursor: not-allowed; }
  .f-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .f-spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin 0.65s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .f-form-footer { margin-top: 16px; text-align: center; font-size: 13px; }
  .dark .f-form-footer { color: #334155; } .light .f-form-footer { color: #94a3b8; }
  .f-form-footer button { background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; padding: 0; margin-left: 4px; transition: color 0.15s; }
  .dark .f-form-footer button { color: #4ade80; } .dark .f-form-footer button:hover { color: #39ff14; }
  .light .f-form-footer button { color: #16a34a; } .light .f-form-footer button:hover { color: #15803d; }

  /* Success */
  .f-success { padding: 48px 32px; text-align: center; }
  .f-success-icon { font-size: 52px; margin-bottom: 16px; animation: popIn 0.5s cubic-bezier(0.16,1,0.3,1); }
  @keyframes popIn { from{transform:scale(0.4);opacity:0} to{transform:scale(1);opacity:1} }
  .f-success-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
  .dark .f-success-title { color: #4ade80; } .light .f-success-title { color: #16a34a; }
  .f-success-sub { font-size: 13.5px; line-height: 1.7; }
  .dark .f-success-sub { color: #64748b; } .light .f-success-sub { color: #64748b; }
  .f-success-name { font-weight: 700; }
  .dark .f-success-name { color: #39ff14; } .light .f-success-name { color: #16a34a; }

  /* Corner controls */
  .corner-controls { position: fixed; bottom: 18px; right: 18px; display: flex; gap: 8px; z-index: 9999; align-items: center; }
  .corner-btn { padding: 7px 12px; border-radius: 8px; border: 1.5px solid; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em; opacity: 0.6; }
  .corner-btn:hover { opacity: 1; transform: translateY(-1px); }
  .dark .corner-btn { background: #151b23; border-color: #2a3441; color: #64748b; }
  .dark .corner-btn:hover { border-color: #39ff14; color: #39ff14; }
  .light .corner-btn { background: #ffffff; border-color: #e2e8f0; color: #94a3b8; }
  .light .corner-btn:hover { border-color: #16a34a; color: #16a34a; }
`;

// ─── HELPERS ───────────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "SITE-SENTINEL v2.1.0 — Staff Registration Portal", cls: "c-green", delay: 0 },
  { text: "[ OK ] Secure registration channel open.",         cls: "c-muted", delay: 220 },
  { text: "  Complete all fields to create your account.",    cls: "c-white", delay: 400 },
];

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "transparent", width: "0%" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: "", color: "transparent", width: "0%" },
    { label: "Weak", color: "#f87171", width: "25%" },
    { label: "Fair", color: "#fbbf24", width: "50%" },
    { label: "Good", color: "#a3e635", width: "75%" },
    { label: "Strong", color: "#39ff14", width: "100%" },
  ];
  return { ...map[score], score };
}

// ─── FRIENDLY REGISTER ─────────────────────────────────────────────────────
function FriendlyRegister({ onGoToLogin, theme, onToggleTheme, onToggleMode, onRegister }) {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const firstRef = useRef(null);
  const emailRef = useRef(null);
  const strength = getStrength(password);

  useEffect(() => { setTimeout(() => firstRef.current?.focus(), 300); }, []);
  useEffect(() => {
    if (step === 1) setTimeout(() => firstRef.current?.focus(), 60);
    if (step === 2) setTimeout(() => emailRef.current?.focus(), 60);
  }, [step]);

  const clearErr = (key) => setErrors(e => ({ ...e, [key]: "" }));

  const validateStep1 = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!studentId.trim()) e.studentId = "Student ID is required.";
    else if (!/^\d{7,12}$/.test(studentId.replace(/-/g, "")))
      e.studentId = "Enter a valid Student ID (7–12 digits).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    else if (strength.score < 2) e.password = "Password is too weak. Add numbers or symbols.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { setBanner(""); if (validateStep1()) setStep(2); };

  const handleSubmit = async () => {
    setBanner("");
    if (!validateStep2()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setPhase("success");
    setTimeout(() => onRegister?.(), 3500);
  };

  const stepState = (n) => {
    if (n < step) return "done";
    if (n === step) return "active";
    return "pending";
  };

  if (phase === "success") {
    return (
      <div className={`f-root ${theme}`}>
        <style>{friendlyStyles}</style>
        <div className="f-card">
          <div className="f-success">
            <div className="f-success-icon">🎉</div>
            <div className="f-success-title">Account created!</div>
            <div className="f-success-sub">
              Welcome, <span className="f-success-name">{firstName} {lastName}</span>.<br />
              Your account is pending admin approval.<br />
              You'll be notified once access is granted.
            </div>
            <div style={{ marginTop: 20, fontSize: 12, color: "#334155" }}>Redirecting to login…</div>
          </div>
        </div>
        <div className="corner-controls">
          <button className="corner-btn" onClick={onToggleTheme}>{theme === "dark" ? "☀ Light" : "🌙 Dark"}</button>
          <button className="corner-btn" onClick={onToggleMode}>&gt;_ CLI</button>
        </div>
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
              src="assets/ccs-logo.png"
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
          <div className="f-title">Create an account</div>
          <div className="f-subtitle">Register as a sit-in monitoring staff member</div>
        </div>

        <div className="f-body">
          {/* Step bar */}
          <div className="f-steps" style={{ marginBottom: 20 }}>
            <div className="f-step">
              <div className={`f-step-circle ${stepState(1)}`}>
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`f-step-label ${stepState(1)}`}>Personal Info</span>
            </div>
            <div className={`f-step-connector ${step > 1 ? "done" : "pending"}`} />
            <div className="f-step">
              <div className={`f-step-circle ${stepState(2)}`}>2</div>
              <span className={`f-step-label ${stepState(2)}`}>Credentials</span>
            </div>
          </div>

          {banner && (
            <div className="f-error-banner"><span>⚠</span><span>{banner}</span></div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              <div className="f-field-row">
                <div className="f-field">
                  <label className="f-label">First name <span style={{color:"#f87171"}}>*</span></label>
                  <input
                    ref={firstRef}
                    className={`f-input${errors.firstName ? " is-error" : firstName ? " is-valid" : ""}`}
                    type="text" value={firstName}
                    onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
                    placeholder="Juan"
                    onKeyDown={e => e.key === "Enter" && handleNext()}
                  />
                  {errors.firstName && <div className="f-error-msg">{errors.firstName}</div>}
                </div>
                <div className="f-field">
                  <label className="f-label">Last name <span style={{color:"#f87171"}}>*</span></label>
                  <input
                    className={`f-input${errors.lastName ? " is-error" : lastName ? " is-valid" : ""}`}
                    type="text" value={lastName}
                    onChange={e => { setLastName(e.target.value); clearErr("lastName"); }}
                    placeholder="dela Cruz"
                    onKeyDown={e => e.key === "Enter" && handleNext()}
                  />
                  {errors.lastName && <div className="f-error-msg">{errors.lastName}</div>}
                </div>
              </div>

              <div className="f-field">
                <label className="f-label">Student ID <span style={{color:"#f87171"}}>*</span></label>
                <div className="f-info-box">
                  <span className="f-info-icon">ℹ️</span>
                  <span>Your Student ID verifies your role as a sit-in monitoring staff. Enter it exactly as shown on your school-issued ID.</span>
                </div>
                <input
                  className={`f-input${errors.studentId ? " is-error" : studentId ? " is-valid" : ""}`}
                  type="text" value={studentId}
                  onChange={e => { setStudentId(e.target.value); clearErr("studentId"); }}
                  placeholder="e.g. 2021-00123"
                  onKeyDown={e => e.key === "Enter" && handleNext()}
                  maxLength={15}
                />
                {errors.studentId && <div className="f-error-msg">{errors.studentId}</div>}
              </div>

              <div className="f-btn-row">
                <button className="f-btn-next" onClick={handleNext}>Continue →</button>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="f-field">
                <label className="f-label">Email address <span style={{color:"#f87171"}}>*</span></label>
                <input
                  ref={emailRef}
                  className={`f-input${errors.email ? " is-error" : email ? " is-valid" : ""}`}
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                  placeholder="juan@school.edu.ph"
                  autoComplete="email"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                {errors.email && <div className="f-error-msg">{errors.email}</div>}
              </div>

              <div className="f-field">
                <label className="f-label">Password <span style={{color:"#f87171"}}>*</span></label>
                <div className="f-input-wrap">
                  <input
                    className={`f-input has-right${errors.password ? " is-error" : password && strength.score >= 2 ? " is-valid" : ""}`}
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  <button className="f-eye-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <div className="f-error-msg">{errors.password}</div>}
                {password && (
                  <div className="f-strength-wrap">
                    <div className="f-strength-bg">
                      <div className="f-strength-fill" style={{ width: strength.width, background: strength.color }} />
                    </div>
                    <span className="f-strength-label" style={{ color: strength.color }}>
                      Strength: {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="f-btn-row">
                <button className="f-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="f-btn-next" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="f-btn-inner"><span className="f-spinner" /> Creating account…</span>
                  ) : (
                    <span className="f-btn-inner">Create account ✓</span>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="f-form-footer">
            Already have an account?
            <button onClick={onGoToLogin}>Sign in</button>
          </div>
        </div>
      </div>

      <div className="corner-controls">
        <button className="corner-btn" onClick={onToggleTheme}>{theme === "dark" ? "☀ Light" : "🌙 Dark"}</button>
        <button className="corner-btn" onClick={onToggleMode}>&gt;_ CLI</button>
      </div>
    </div>
  );
}

// ─── TERMINAL REGISTER (original) ─────────────────────────────────────────
function TerminalRegister({ onRegister, onGoToLogin, onToggleMode }) {
  const [bootVisible, setBootVisible] = useState(0);
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const firstRef = useRef(null);
  const emailRef = useRef(null);
  const strength = getStrength(password);

  useEffect(() => {
    BOOT_LINES.forEach((l, i) => setTimeout(() => setBootVisible(i + 1), l.delay));
    setTimeout(() => firstRef.current?.focus(), 600);
  }, []);
  useEffect(() => {
    if (step === 1) setTimeout(() => firstRef.current?.focus(), 60);
    if (step === 2) setTimeout(() => emailRef.current?.focus(), 60);
  }, [step]);

  const clearErr = (key) => setErrors(e => ({ ...e, [key]: "" }));
  const validateStep1 = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!studentId.trim()) e.studentId = "Student ID is required.";
    else if (!/^\d{7,12}$/.test(studentId.replace(/-/g, "")))
      e.studentId = "Enter a valid Student ID (7–12 digits).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validateStep2 = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    else if (strength.score < 2) e.password = "Password is too weak. Add numbers or symbols.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleNext = () => { setBanner(""); if (validateStep1()) setStep(2); };
  const handleSubmit = async () => {
    setBanner(""); if (!validateStep2()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false); setPhase("success");
    setTimeout(() => onRegister?.(), 3500);
  };
  const booted = bootVisible >= BOOT_LINES.length;

  return (
    <>
      <style>{termStyles}</style>
      <div className="term-root">
        <div className="terminal">
          <div className="titlebar">
            <div className="dot dot-red" /><div className="dot dot-yellow" /><div className="dot dot-green-mac" />
            <span className="titlebar-title">sentinel@monitor: ~ — register</span>
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
            <div className="success-body">
              <div className="success-icon">✦</div>
              <div className="success-title">[ OK ] Account created successfully.</div>
              <div className="success-sub">
                Welcome aboard, <span style={{ color: "var(--green)" }}>{firstName} {lastName}</span>.<br />
                Your account is pending admin approval.<br />
                You will be notified once access is granted.
              </div>
              <div style={{ marginTop: 16, fontSize: 10, color: "#252525" }}>Redirecting to login...</div>
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
              {banner && <div className="error-banner"><span style={{color:"var(--red)"}}>✕</span><span>{banner}</span></div>}
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
                      {errors.firstName && <div className="field-err">⚠ {errors.firstName}</div>}
                    </div>
                    <div>
                      <div className="field-label"><span className="label-prefix">//</span><span>last name</span><span className="label-req">*</span></div>
                      <div className="field-wrap">
                        <input className={`field-input${errors.lastName ? " is-error" : lastName ? " is-valid" : ""}`}
                          type="text" value={lastName} onChange={e => { setLastName(e.target.value); clearErr("lastName"); }}
                          placeholder="dela Cruz" onKeyDown={e => e.key === "Enter" && handleNext()} />
                      </div>
                      {errors.lastName && <div className="field-err">⚠ {errors.lastName}</div>}
                    </div>
                  </div>
                  <div className="field-label"><span className="label-prefix">//</span><span>student id</span><span className="label-req">*</span><span className="label-hint">from your school ID</span></div>
                  <div className="id-info"><span className="id-info-icon">ℹ</span><span>Your Student ID verifies your role as a sit-in monitoring staff member. Enter it exactly as shown on your school-issued ID.</span></div>
                  <div className="field-wrap">
                    <input className={`field-input${errors.studentId ? " is-error" : studentId ? " is-valid" : ""}`}
                      type="text" value={studentId} onChange={e => { setStudentId(e.target.value); clearErr("studentId"); }}
                      placeholder="e.g. 2021-00123" onKeyDown={e => e.key === "Enter" && handleNext()} maxLength={15} />
                  </div>
                  {errors.studentId && <div className="field-err">⚠ {errors.studentId}</div>}
                  <div className="btn-row">
                    <button className="btn-next" onClick={handleNext}><span className="btn-inner">$ next --step 2 →</span></button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="field-label"><span className="label-prefix">//</span><span>email address</span><span className="label-req">*</span><span className="label-hint">your login identifier</span></div>
                  <div className="field-wrap">
                    <input ref={emailRef} className={`field-input${errors.email ? " is-error" : email ? " is-valid" : ""}`}
                      type="email" value={email} onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                      placeholder="juan@school.edu.ph" autoComplete="email" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  </div>
                  {errors.email && <div className="field-err">⚠ {errors.email}</div>}
                  <div className="field-label"><span className="label-prefix">//</span><span>password</span><span className="label-req">*</span><span className="label-hint">min. 8 characters</span></div>
                  <div className="field-wrap">
                    <input className={`field-input has-toggle${errors.password ? " is-error" : password && strength.score >= 2 ? " is-valid" : ""}`}
                      type={showPass ? "text" : "password"} value={password}
                      onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                      placeholder="create a strong password" autoComplete="new-password"
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    <button className="toggle-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                      {showPass ? "hide" : "show"}
                    </button>
                  </div>
                  {errors.password && <div className="field-err">⚠ {errors.password}</div>}
                  {password && (
                    <div className="strength-wrap">
                      <div className="strength-bar-bg"><div className="strength-bar-fill" style={{ width: strength.width, background: strength.color }} /></div>
                      <span className="strength-label" style={{ color: strength.color }}>{`// strength: ${strength.label.toLowerCase()}`}</span>
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
              <div className="form-footer">
                Already have an account?{" "}
                <button onClick={onGoToLogin}>$ login --existing</button>
              </div>
            </div>
          )}
          <div className="term-hint">* all fields are required</div>
        </div>
        <button className="mode-toggle-btn" onClick={onToggleMode}>⊞ friendly UI</button>
      </div>
    </>
  );
}

// ─── EXPORT ────────────────────────────────────────────────────────────────
export default function Register({ onRegister, onGoToLogin, uiMode, theme, onToggleMode, onToggleTheme }) {
  if (uiMode === "terminal") {
    return <TerminalRegister onRegister={onRegister} onGoToLogin={onGoToLogin} onToggleMode={onToggleMode} />;
  }
  return <FriendlyRegister onRegister={onRegister} onGoToLogin={onGoToLogin} theme={theme} onToggleTheme={onToggleTheme} onToggleMode={onToggleMode} />;
}