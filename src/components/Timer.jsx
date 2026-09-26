import { useState, useEffect } from "react";
import { AREAS } from "../areas";

const PRESETS = [15, 75, 100];

const MOCK_SECTION_SECONDS = 15 * 60;
const MOCK_BREAK_SECONDS = 60;

// exam segment, break segment, exam segment, break segment, ... (no trailing break)
const MOCK_SEGMENTS = AREAS.flatMap((area, i) => {
  const segs = [{ type: "exam", label: area.name, duration: MOCK_SECTION_SECONDS, range: { start: area.start, end: area.end } }];
  if (i < AREAS.length - 1) segs.push({ type: "break", label: "쉬는 시간", duration: MOCK_BREAK_SECONDS, range: null });
  return segs;
});

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}분 ${String(s).padStart(2, "0")}초`;
}

export default function Timer({ onActiveRangeChange, onModeChange }) {
  const [totalSeconds, setTotalSeconds] = useState(75 * 60);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [customApplied, setCustomApplied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const [examMode, setExamMode] = useState(true);
  const [exam, setExam] = useState({ index: 0, remaining: MOCK_SEGMENTS[0].duration, finished: false });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (examMode) {
        setExam((prev) => {
          if (prev.finished) return prev;
          if (prev.remaining > 1) return { ...prev, remaining: prev.remaining - 1 };
          const nextIndex = prev.index + 1;
          return nextIndex < MOCK_SEGMENTS.length
            ? { index: nextIndex, remaining: MOCK_SEGMENTS[nextIndex].duration, finished: false }
            : { ...prev, remaining: 0, finished: true };
        });
      } else {
        setElapsed((e) => e + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, examMode]);

  useEffect(() => {
    if (exam.finished) setRunning(false);
  }, [exam.finished]);

  // Stop countdown when time runs out
  useEffect(() => {
    if (!examMode && elapsed >= totalSeconds && running) setRunning(false);
  }, [elapsed, examMode, totalSeconds, running]);

  useEffect(() => {
    if (!examMode) {
      onActiveRangeChange?.(null);
    } else if (exam.finished) {
      onActiveRangeChange?.({ start: 1, end: 0 }); // lock all after exam ends
    } else {
      const seg = MOCK_SEGMENTS[exam.index];
      onActiveRangeChange?.(seg.range ?? { start: 1, end: 0 }); // 쉬는 시간: 전부 잠금
    }
  }, [examMode, exam.index, exam.finished, onActiveRangeChange]);

  const timeFinished = !examMode && elapsed >= totalSeconds;

  const toggleRun = () => {
    if (examMode && exam.finished) return;
    if (timeFinished) return;
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    if (examMode) setExam({ index: 0, remaining: MOCK_SEGMENTS[0].duration, finished: false });
    else setElapsed(0);
  };

  const applyCustom = () => {
    const secs = customMinutes * 60 + customSeconds;
    if (secs > 0) {
      setTotalSeconds(secs);
      setElapsed(0);
      setCustomMode(false);
      setCustomApplied(true);
    }
  };

  const selectMode = (value) => {
    setRunning(false);
    const isExam = value === "mockExam";
    setExamMode(isExam);
    setCustomMode(value === "custom");
    setCustomApplied(false);
    onModeChange?.(isExam);
    if (isExam) {
      setExam({ index: 0, remaining: MOCK_SEGMENTS[0].duration, finished: false });
    } else if (value !== "custom") {
      const secs = Number(value);
      if (!isNaN(secs)) { setTotalSeconds(secs); setElapsed(0); }
    }
  };

  const remaining = totalSeconds - elapsed;
  const selectValue = examMode ? "mockExam" : customApplied ? "custom" : String(totalSeconds);
  const currentSegment = MOCK_SEGMENTS[exam.index];

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
                onFocus={(e) => e.target.select()}
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
                onFocus={(e) => e.target.select()}
              />
              <span className="input-label">초</span>
            </div>
            <div className="custom-buttons">
              <button className="set-btn" onClick={applyCustom}>설정</button>
              <button className="cancel-btn" onClick={() => setCustomMode(false)}>취소</button>
            </div>
          </div>
        ) : (
          <div className="timer-mode-row">
            <select
              className="time-select"
              value={selectValue}
              onChange={(e) => selectMode(e.target.value)}
            >
              {PRESETS.map((m) => (
                <option key={m} value={m * 60}>{m}분</option>
              ))}
              <option value="custom">사용자 지정</option>
              <option value="mockExam">모의고사 모드</option>
            </select>
            {customApplied && (
              <button className="edit-time-btn" onClick={() => setCustomMode(true)} title="시간 변경">✎</button>
            )}
          </div>
        )}
      </div>

      {examMode ? (
        <div className="timer-display exam-flash" key={exam.index}>
          {exam.finished ? (
            <span className="current-time">모의고사 종료</span>
          ) : (
            <>
              <span className="current-time">{formatTime(exam.remaining)}</span>
              <span className={`total-time section-label ${currentSegment.type}`}>{currentSegment.label}</span>
            </>
          )}
        </div>
      ) : (
        <div className="timer-display">
          {timeFinished ? (
            <span className="current-time">시간 종료</span>
          ) : (
            <>
              <span className="current-time">{formatTime(remaining)}</span>
              <span className="total-time">/ {formatTime(totalSeconds)}</span>
            </>
          )}
        </div>
      )}

      <div className="timer-buttons">
        <button
          className={`timer-btn ${running ? "stop-btn" : "start-btn"}`}
          onClick={toggleRun}
          disabled={timeFinished || (examMode && exam.finished)}
        >
          {running ? "정지" : "시작"}
        </button>
        <button className="timer-btn reset-btn" onClick={reset}>리셋</button>
      </div>
    </div>
  );
}
