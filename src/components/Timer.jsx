import { useState, useEffect } from "react";

const PRESETS = [5, 15, 100];

function formatElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}분 ${String(s).padStart(2, "0")}초`;
}

export default function Timer() {
  const [totalMinutes, setTotalMinutes] = useState(100);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const toggleRun = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };
  const applyCustom = () => {
    const totalSeconds = customMinutes * 60 + customSeconds;
    if (totalSeconds > 0) {
      setTotalMinutes(Math.floor(totalSeconds / 60));
      setElapsed(0);
      setCustomMode(false);
    }
  };
  const totalLabel = customMode ? `${customMinutes}분 ${customSeconds}초` : `${totalMinutes}분`;

  return (
    <div className="timer" onKeyDown={(e) => e.stopPropagation()}>
      <div className="timer-controls">
        {customMode ? (
          <div className="custom-time-inputs">
            <div className="custom-input-group">
              <input
                type="number"
                min={0}
                max={999}
                value={customMinutes}
                className="custom-input"
                placeholder="분"
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
              />
              <span className="input-label">분</span>
              <input
                type="number"
                min={0}
                max={59}
                value={customSeconds}
                className="custom-input"
                placeholder="초"
                onChange={(e) => setCustomSeconds(Number(e.target.value))}
              />
              <span className="input-label">초</span>
            </div>
            <div className="custom-buttons">
              <button className="set-btn" onClick={applyCustom}>설정</button>
              <button className="cancel-btn" onClick={() => setCustomMode(false)}>취소</button>
            </div>
          </div>
        ) : (
          <select
            className="time-select"
            value={totalMinutes}
            onChange={(e) => (e.target.value === "custom" ? setCustomMode(true) : setTotalMinutes(Number(e.target.value)))}
          >
            {PRESETS.map((m) => (
              <option key={m} value={m}>{m}분</option>
            ))}
            <option value="custom">사용자 지정</option>
          </select>
        )}
      </div>
      <div className="timer-display">
        <span className="current-time">{formatElapsed(elapsed)}</span>
        <span className="total-time">/ {totalLabel}</span>
      </div>
      <div className="timer-buttons">
        <button className={`timer-btn ${running ? "stop-btn" : "start-btn"}`} onClick={toggleRun}>
          {running ? "정지" : "시작"}
        </button>
        <button className="timer-btn reset-btn" onClick={reset}>리셋</button>
      </div>
    </div>
  );
}
