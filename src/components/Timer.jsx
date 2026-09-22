import { useState, useEffect } from "react";

const PRESETS = [75, 100];

const MOCK_SECTION_NAMES = ["언어이해", "자료해석", "창의수리", "언어추리", "수열"];
const MOCK_SECTION_SECONDS = 15 * 60;
const MOCK_BREAK_SECONDS = 60;
const QUESTIONS_PER_SECTION = 20; // 5 sections x 20 = 100 questions total

// exam segment, break segment, exam segment, break segment, ... (no trailing break)
const MOCK_SEGMENTS = MOCK_SECTION_NAMES.flatMap((name, i) => {
  const range = { start: i * QUESTIONS_PER_SECTION + 1, end: (i + 1) * QUESTIONS_PER_SECTION };
  const segs = [{ type: "exam", label: name, duration: MOCK_SECTION_SECONDS, range }];
  if (i < MOCK_SECTION_NAMES.length - 1) segs.push({ type: "break", label: "쉬는 시간", duration: MOCK_BREAK_SECONDS, range: null });
  return segs;
});

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}분 ${String(s).padStart(2, "0")}초`;
}

export default function Timer({ onActiveRangeChange }) {
  const [totalMinutes, setTotalMinutes] = useState(75);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const [examMode, setExamMode] = useState(false);
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

  useEffect(() => {
    if (!examMode || exam.finished) {
      onActiveRangeChange?.(null);
    } else {
      onActiveRangeChange?.(MOCK_SEGMENTS[exam.index].range);
    }
  }, [examMode, exam.index, exam.finished, onActiveRangeChange]);

  const toggleRun = () => {
    if (examMode && exam.finished) return;
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    if (examMode) setExam({ index: 0, remaining: MOCK_SEGMENTS[0].duration, finished: false });
    else setElapsed(0);
  };

  const applyCustom = () => {
    const totalSeconds = customMinutes * 60 + customSeconds;
    if (totalSeconds > 0) {
      setTotalMinutes(Math.floor(totalSeconds / 60));
      setElapsed(0);
      setCustomMode(false);
    }
  };

  const selectMode = (value) => {
    setRunning(false);
    setExamMode(value === "mockExam");
    setCustomMode(value === "custom");
    if (value === "mockExam") setExam({ index: 0, remaining: MOCK_SEGMENTS[0].duration, finished: false });
    else if (value !== "custom") setTotalMinutes(Number(value));
  };

  const totalLabel = customMode ? `${customMinutes}분 ${customSeconds}초` : `${totalMinutes}분`;
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
            value={examMode ? "mockExam" : totalMinutes}
            onChange={(e) => selectMode(e.target.value)}
          >
            {PRESETS.map((m) => (
              <option key={m} value={m}>{m}분</option>
            ))}
            <option value="custom">사용자 지정</option>
            <option value="mockExam">모의고사 모드</option>
          </select>
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
          <span className="current-time">{formatTime(elapsed)}</span>
          <span className="total-time">/ {totalLabel}</span>
        </div>
      )}

      <div className="timer-buttons">
        <button className={`timer-btn ${running ? "stop-btn" : "start-btn"}`} onClick={toggleRun}>
          {running ? "정지" : "시작"}
        </button>
        <button className="timer-btn reset-btn" onClick={reset}>리셋</button>
      </div>
    </div>
  );
}
