import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

  *, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  width: 100%;
}

  :root {
    --bg: #0c0c0c;
    --terminal: #0f0f0f;
    --border: #2a2a2a;
    --green: #39ff14;
    --green-dim: #1a7a08;
    --green-glow: rgba(57, 255, 20, 0.15);
    --amber: #ffb300;
    --red: #ff3333;
    --text: #cccccc;
    --muted: #555555;
    --white: #f0f0f0;
  }

  .term-root {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    position: relative;
    overflow: hidden;
  }

  /* CRT scanline effect */
  .term-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  /* CRT flicker */
  .term-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(57, 255, 20, 0.015);
    pointer-events: none;
    z-index: 99;
    animation: flicker 8s infinite;
  }

  @keyframes flicker {
    0%, 95%, 100% { opacity: 1; }
    96% { opacity: 0.85; }
    97% { opacity: 1; }
    98% { opacity: 0.9; }
  }

  /* Terminal window */
  .terminal {
    width: 640px;
    background: var(--terminal);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow:
      0 0 0 1px rgba(57,255,20,0.05),
      0 20px 60px rgba(0,0,0,0.8),
      0 0 40px rgba(57,255,20,0.03);
    animation: termIn 0.4s ease forwards;
    opacity: 0;
    transform: scale(0.97);
    position: relative;
    z-index: 10;
  }

  @keyframes termIn {
    to { opacity: 1; transform: scale(1); }
  }

  /* Title bar */
  .titlebar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #161616;
    border-bottom: 1px solid var(--border);
    border-radius: 6px 6px 0 0;
  }

  .titlebar-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f57; }
  .dot-yellow { background: #febc2e; }
  .dot-green { background: #28c840; }

  .titlebar-title {
    flex: 1;
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  /* Terminal body */
  .term-body {
    padding: 24px;
    min-height: 400px;
  }

  /* Output lines */
  .output-line {
    font-size: 13px;
    line-height: 1.8;
    white-space: pre;
  }

  .out-muted { color: var(--muted); }
  .out-green { color: var(--green); }
  .out-amber { color: var(--amber); }
  .out-red { color: var(--red); }
  .out-dim { color: #2a2a2a; }
  .out-white { color: var(--white); }

  /* Prompt line */
  .prompt-line {
    display: flex;
    align-items: center;
    margin-top: 4px;
    flex-wrap: nowrap;
  }

  .prompt-user { color: var(--green); font-size: 13px; }
  .prompt-at { color: var(--muted); font-size: 13px; }
  .prompt-host { color: var(--amber); font-size: 13px; }
  .prompt-path { color: var(--text); font-size: 13px; }
  .prompt-symbol { color: var(--green); font-size: 13px; margin: 0 4px; }
  .prompt-cmd { color: #555; font-size: 13px; margin-right: 8px; }

  /* Input field */
  .term-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--white);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    flex: 1;
    caret-color: var(--green);
    min-width: 0;
  }

  .term-input::placeholder {
    color: #2a2a2a;
  }

  .term-input[type="password"] {
    letter-spacing: 0.2em;
  }

  /* Divider */
  .term-divider {
    border: none;
    border-top: 1px solid #1a1a1a;
    margin: 14px 0;
  }

  /* Submit area */
  .term-submit {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #1a1a1a;
  }

  .submit-btn {
    background: none;
    border: 1px solid var(--green-dim);
    color: var(--green);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.06em;
    border-radius: 2px;
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--green-glow);
    border-color: var(--green);
    box-shadow: 0 0 12px rgba(57,255,20,0.2);
  }

  .submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: none;
    border: 1px solid #222;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.06em;
    border-radius: 2px;
  }

  .cancel-btn:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .step-indicator {
    margin-left: auto;
    font-size: 11px;
    color: #2a2a2a;
  }

  /* Terminal hint */
  .term-hint {
    font-size: 11px;
    color: #222;
    padding: 10px 24px 16px;
    text-align: center;
    letter-spacing: 0.04em;
    border-top: 1px solid #161616;
  }

  /* Glow on focus */
  .terminal:focus-within {
    box-shadow:
      0 0 0 1px rgba(57,255,20,0.08),
      0 20px 60px rgba(0,0,0,0.8),
      0 0 60px rgba(57,255,20,0.05);
  }
`;

const BOOT_LINES = [
  { text: "SITE-SENTINEL v2.1.0 — Infrastructure Monitor", cls: "out-green", delay: 0 },
  { text: "Copyright (c) 2026 Sentinel Systems. All rights reserved.", cls: "out-muted", delay: 80 },
  { text: "", cls: "out-muted", delay: 120 },
  { text: "[ OK ] Loading kernel modules...", cls: "out-muted", delay: 200 },
  { text: "[ OK ] Starting network interface...", cls: "out-muted", delay: 330 },
  { text: "[ OK ] Mounting /dev/monitor...", cls: "out-muted", delay: 450 },
  { text: "[ OK ] Establishing secure channel...", cls: "out-green", delay: 600 },
  { text: "", cls: "out-muted", delay: 680 },
  { text: "──────────────────────────────────────────────────", cls: "out-dim", delay: 740 },
  { text: "  Authentication required to proceed.", cls: "out-white", delay: 820 },
  { text: "  Enter your credentials below to continue.", cls: "out-muted", delay: 900 },
  { text: "──────────────────────────────────────────────────", cls: "out-dim", delay: 960 },
  { text: "", cls: "out-muted", delay: 1000 },
];

const LOAD_SEQUENCE = [
  { text: "[ OK ] Identity verified.",                              cls: "out-green",  delay: 0 },
  { text: "[ OK ] Session token issued. TTL: 3600s",               cls: "out-green",  delay: 300 },
  { text: "",                                                        cls: "out-muted",  delay: 500 },
  { text: "> Initializing dashboard environment...",                cls: "out-amber",  delay: 620 },
  { text: "  Loading site registry..................  [DONE]",      cls: "out-muted",  delay: 900 },
  { text: "  Fetching monitor configurations........  [DONE]",     cls: "out-muted",  delay: 1150 },
  { text: "  Connecting to uptime agents............  [DONE]",     cls: "out-muted",  delay: 1400 },
  { text: "  Resolving geo-location nodes...........  [DONE]",     cls: "out-muted",  delay: 1650 },
  { text: "  Mounting /dashboard/map................  [DONE]",     cls: "out-muted",  delay: 1900 },
  { text: "  Syncing alert thresholds...............  [DONE]",     cls: "out-muted",  delay: 2100 },
  { text: "",                                                        cls: "out-muted",  delay: 2300 },
  { text: "[ OK ] All systems nominal. 12 sites online.",           cls: "out-green",  delay: 2450 },
  { text: "[ OK ] Dashboard ready.",                                cls: "out-green",  delay: 2700 },
  { text: "",                                                        cls: "out-muted",  delay: 2900 },
  { text: "  Launching interface...",                               cls: "out-muted",  delay: 3050 },
];

function BootLoader({ onDone }) {
  const [visible, setVisible] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    LOAD_SEQUENCE.forEach((line, i) => {
      setTimeout(() => setVisible(i + 1), line.delay);
    });
    // Redirect after last line
    const total = LOAD_SEQUENCE[LOAD_SEQUENCE.length - 1].delay + 900;
    setTimeout(() => onDone?.(), total);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible]);

  return (
    <div style={{ marginTop: "10px" }}>
      {LOAD_SEQUENCE.slice(0, visible).map((line, i) => (
        <div key={i} className={`output-line ${line.cls}`}>{line.text}</div>
      ))}
      {/* Blinking cursor at end */}
      {visible > 0 && visible < LOAD_SEQUENCE.length && (
        <span className="output-line out-muted">
          {"  "}<span style={{
            display: "inline-block",
            width: "8px", height: "13px",
            background: "#39ff14",
            animation: "blink 1s step-end infinite",
            verticalAlign: "middle"
          }} />
        </span>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default function Login({ onLogin }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Boot animation
  useEffect(() => {
    BOOT_LINES.forEach((_, i) => {
      setTimeout(() => setVisibleLines(i + 1), BOOT_LINES[i].delay);
    });
  }, []);

  // Focus input once booted
  const booted = visibleLines >= BOOT_LINES.length;
  useEffect(() => {
    if (booted) setTimeout(() => inputRef.current?.focus(), 100);
  }, [booted]);

  // Loading dots
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setLoadingDots(d => d.length >= 3 ? "" : d + "."), 350);
    return () => clearInterval(iv);
  }, [loading]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLines, step, loading, errorMsg]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleNext();
  };

  const handleNext = async () => {
    if (step === "email") {
      if (!email.trim()) return;
      setStep("password");
      setTimeout(() => inputRef.current?.focus(), 40);
      return;
    }
    if (step === "password") {
      if (!password) return;
      setStep("submitting");
      setLoading(true);
      await new Promise(r => setTimeout(r, 2200));
      setLoading(false);
      if (email === "admin@sentinel.io" && password === "password") {
        setStep("success");
      } else {
        setErrorMsg("Access denied. Invalid credentials. [code: AUTH_FAIL_403]");
        setStep("error");
      }
    }
  };

  const handleReset = () => {
    setEmail(""); setPassword(""); setErrorMsg("");
    setStep("email");
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="term-root">
        <div className="terminal">

          {/* macOS-style title bar */}
          <div className="titlebar">
            <div className="titlebar-dot dot-red" />
            <div className="titlebar-dot dot-yellow" />
            <div className="titlebar-dot dot-green" />
            <span className="titlebar-title">sentinel@monitor: ~ — bash</span>
          </div>

          <div className="term-body">

            {/* Boot sequence */}
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`output-line ${line.cls}`}>{line.text}</div>
            ))}

            {/* Auth form */}
            {booted && (
              <>
                {/* Email prompt */}
                <div className="prompt-line">
                  <span className="prompt-user">admin</span>
                  <span className="prompt-at">@</span>
                  <span className="prompt-host">sentinel</span>
                  <span className="prompt-path"> ~ </span>
                  <span className="prompt-symbol">$</span>
                  <span className="prompt-cmd">login --user</span>
                  {step === "email" ? (
                    <input
                      ref={step === "email" ? inputRef : null}
                      className="term-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="user@domain.io"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  ) : (
                    <span style={{ color: "var(--white)", fontSize: "13px" }}>{email}</span>
                  )}
                </div>

                {/* Password prompt */}
                {["password","submitting","error","success"].includes(step) && (
                  <div className="prompt-line">
                    <span className="prompt-user">admin</span>
                    <span className="prompt-at">@</span>
                    <span className="prompt-host">sentinel</span>
                    <span className="prompt-path"> ~ </span>
                    <span className="prompt-symbol">$</span>
                    <span className="prompt-cmd">login --password</span>
                    {step === "password" ? (
                      <input
                        ref={step === "password" ? inputRef : null}
                        className="term-input"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="access key"
                        autoComplete="current-password"
                      />
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: "13px" }}>
                        {"•".repeat(Math.max(password.length, 10))}
                      </span>
                    )}
                  </div>
                )}

                {/* Authenticating */}
                {step === "submitting" && (
                  <div style={{ marginTop: "10px" }}>
                    <div className="output-line out-amber">{`> Authenticating${loadingDots}`}</div>
                    <div className="output-line out-muted">{"  Checking /etc/sentinel/passwd..."}</div>
                    <div className="output-line out-muted">{"  Verifying session token..."}</div>
                  </div>
                )}

                {/* Error */}
                {step === "error" && (
                  <div style={{ marginTop: "10px" }}>
                    <div className="output-line out-red">{`bash: error: ${errorMsg}`}</div>
                    <div className="output-line out-muted">{"  Run 'login --retry' to try again."}</div>
                    <div style={{ marginTop: "10px" }}>
                      <button
                        className="submit-btn"
                        style={{ borderColor: "#552222", color: "#ff5555" }}
                        onClick={handleReset}
                      >
                        [retry] login --retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Success */}
                {step === "success" && (
                  <BootLoader onDone={onLogin} />
                )}

                {/* Action bar */}
                {["email","password"].includes(step) && (
                  <div className="term-submit">
                    <button className="submit-btn" onClick={handleNext}>
                      {step === "email" ? "[↵ enter] next" : "[↵ enter] authenticate"}
                    </button>
                    <button className="cancel-btn" onClick={handleReset}>[ctrl+c] clear</button>
                    <span className="step-indicator">{step === "email" ? "1 / 2" : "2 / 2"}</span>
                  </div>
                )}
              </>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="term-hint">
            demo credentials → admin@sentinel.io / password
          </div>
        </div>
      </div>
    </>
  );
}