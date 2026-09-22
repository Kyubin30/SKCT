import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const QUESTION_COUNT = 100;
const CHOICES = [1, 2, 3, 4, 5];
const QUESTION_NUMBERS = Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1);
const STATUS_FILTERS = [
  { key: "all", label: "전체" },
  { key: "correct", label: "정답" },
  { key: "wrong", label: "오답" },
  { key: "unanswered", label: "미답" },
];

export default function OMRSheet({ onGradingToggle, activeRange }) {
  const [answers, setAnswers] = useLocalStorage("skct-omr-answers", {});
  const [gradingInput, setGradingInput] = useState("");
  const [gradingResult, setGradingResult] = useState(null);
  const [gradingMode, setGradingMode] = useState(false);
  const [questionStatuses, setQuestionStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [snapshots, setSnapshots] = useLocalStorage("skct-question-snapshots", {});
  const [viewingSnapshot, setViewingSnapshot] = useState(null);

  useEffect(() => {
    onGradingToggle?.(gradingMode);
  }, [gradingMode, onGradingToggle]);

  // NotePad already keeps its live content in localStorage - copy whatever's
  // there right now into this question's slot instead of lifting shared state.
  const captureSnapshot = (questionNum) => {
    let memo = "";
    try {
      const raw = localStorage.getItem("skct-notepad-memo");
      memo = raw ? JSON.parse(raw) : "";
    } catch {
      // ignore malformed storage
    }
    const canvas = localStorage.getItem("skct-notepad-canvas");
    if (!memo && !canvas) return;
    setSnapshots((prev) => ({ ...prev, [questionNum]: { memo, canvas } }));
  };

  const selectAnswer = (questionNum, choice) => {
    setAnswers((prev) => {
      if (prev[questionNum] === choice) {
        const next = { ...prev };
        delete next[questionNum];
        return next;
      }
      return { ...prev, [questionNum]: choice };
    });
    setGradingResult(null);
    captureSnapshot(questionNum);
  };

  const submitGrading = () => {
    if (!gradingInput.trim()) {
      alert("정답을 입력해주세요!");
      return;
    }
    const key = gradingInput
      .split(/[,\s]+/)
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !isNaN(v) && v >= 1 && v <= 5);
    if (key.length === 0) {
      alert("올바른 정답 형식이 아닙니다. 예: 1,2,3,4,5 또는 1 2 3 4 5");
      return;
    }
    let correct = 0;
    const statuses = key.map((correctAnswer, idx) => {
      const num = idx + 1;
      const userAnswer = answers[num];
      let status;
      if (userAnswer === undefined) status = "unanswered";
      else if (userAnswer === correctAnswer) {
        status = "correct";
        correct++;
      } else status = "wrong";
      return { num, status, userAnswer: userAnswer ?? null, correctAnswer };
    });
    setQuestionStatuses(statuses);
    setStatusFilter("all");
    setGradingResult({ correct, total: key.length, percentage: ((correct / key.length) * 100).toFixed(1) });
  };

  const clearAll = () => {
    if (window.confirm("모든 답안을 지우시겠습니까?")) {
      setAnswers({});
      setGradingResult(null);
      setQuestionStatuses([]);
    }
  };

  const clearGradingInput = () => {
    setGradingInput("");
    setGradingResult(null);
    setQuestionStatuses([]);
  };

  const filterGradingKeydown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      return;
    }
    if (!/^[0-9]$/.test(e.key) && e.key !== "," && e.key !== " " && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  return (
    <div className="omr-sheet">
      <div className="omr-header">
        <h2>OMR 답안지</h2>
        <div className="omr-actions">
          <button className="grade-btn" onClick={() => setGradingMode((m) => !m)}>
            {gradingMode ? "답안지 보기" : "채점하기"}
          </button>
          <button className="clear-all-btn" onClick={clearAll}>답안 초기화</button>
        </div>
        {activeRange && (
          <p className="active-range-notice">현재 구간: {activeRange.start}~{activeRange.end}번만 마킹 가능</p>
        )}
      </div>

      {gradingMode ? (
        <div className="grading-section">
          <div className="grading-input">
            <h3>정답 입력</h3>
            <p className="help-text">정답을 숫자로 입력하세요 (쉼표 또는 공백으로 구분)</p>
            <p className="help-text-example">예: 1,2,3,4,5 또는 1 2 3 4 5</p>
            <textarea
              value={gradingInput}
              onChange={(e) => setGradingInput(e.target.value)}
              onKeyDown={filterGradingKeydown}
              placeholder="1,2,3,4,5,1,2,3,4,5,..."
              className="answer-input"
              rows={6}
            />
            <div className="grading-buttons">
              <button className="submit-grade-btn" onClick={submitGrading}>채점하기</button>
              <button className="clear-grade-btn" onClick={clearGradingInput}>입력 지우기</button>
            </div>
          </div>

          {gradingResult && (
            <div className="score-result">
              <h3>채점 결과</h3>
              <div className="score-display">
                <div className="score-item">정답: {gradingResult.correct}개</div>
                <div className="score-item">오답: {gradingResult.total - gradingResult.correct}개</div>
                <div className="score-item">총 문항: {gradingResult.total}개</div>
                <div className="score-item large">점수: {gradingResult.percentage}점</div>
              </div>
              {questionStatuses.length > 0 && (
                <div className="question-results">
                  <div className="question-results-header">
                    <h4>전체 문항 결과</h4>
                    <div className="status-filter">
                      {STATUS_FILTERS.map((f) => (
                        <button
                          key={f.key}
                          className={statusFilter === f.key ? "active" : ""}
                          onClick={() => setStatusFilter(f.key)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="question-results-list">
                    {questionStatuses
                      .filter((q) => statusFilter === "all" || q.status === statusFilter)
                      .map((q) => (
                        <div
                          className={`question-result-item ${q.status}`}
                          key={q.num}
                          onClick={() => setViewingSnapshot(q.num)}
                        >
                          <span className="question-number">{q.num}번</span>
                          {q.status === "unanswered" ? (
                            <span className="result-label">미답 (정답 {q.correctAnswer})</span>
                          ) : (
                            <span className="result-label">
                              내 답 {q.userAnswer}{q.status === "wrong" ? ` → 정답 ${q.correctAnswer}` : " (정답)"}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                  <button className="export-pdf-btn" onClick={() => window.print()} title="인쇄 대화상자에서 'PDF로 저장'을 선택하세요">
                    오답노트 PDF로 저장
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="omr-content">
          <div className="omr-grid">
            {QUESTION_NUMBERS.map((num) => {
              const inactive = activeRange && (num < activeRange.start || num > activeRange.end);
              return (
                <div className={`omr-row ${inactive ? "inactive" : ""}`} key={num}>
                  <div className="question-number" onClick={() => setViewingSnapshot(num)}>{num}</div>
                  <div className="choices">
                    {CHOICES.map((choice) => (
                      <button
                        key={choice}
                        className={`choice-btn ${answers[num] === choice ? "selected" : ""}`}
                        onClick={() => selectAnswer(num, choice)}
                        disabled={inactive}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="omr-footer">
        <div className="answer-count">표시한 답안: {Object.keys(answers).length} / {QUESTION_COUNT}</div>
      </div>

      {/* Hidden in normal view; @media print swaps this in place of the whole app (see App.css). */}
      <div className="print-only wrong-answer-note">
        <h1>오답노트</h1>
        <section>
          <h2>못 푼 문제</h2>
          <p>
            {questionStatuses.filter((q) => q.status === "unanswered").length > 0
              ? questionStatuses.filter((q) => q.status === "unanswered").map((q) => q.num).join(", ")
              : "없음"}
          </p>
        </section>
        <section>
          <h2>틀린 문제</h2>
          {questionStatuses.filter((q) => q.status === "wrong").length === 0 && <p>없음</p>}
          {questionStatuses
            .filter((q) => q.status === "wrong")
            .map((w) => {
              const snap = snapshots[w.num];
              return (
                <div className="print-question-block" key={w.num}>
                  <h3>{w.num}번 - 내 답 {w.userAnswer ?? "미답"} → 정답 {w.correctAnswer}</h3>
                  <div className="print-memo">
                    <strong>메모</strong>
                    <p>{snap?.memo || "(메모 없음)"}</p>
                  </div>
                  {snap?.canvas && (
                    <div className="print-drawing">
                      <strong>그림판</strong>
                      <img src={snap.canvas} alt={`${w.num}번 그림`} />
                    </div>
                  )}
                </div>
              );
            })}
        </section>
      </div>

      {viewingSnapshot !== null && (
        <div className="snapshot-overlay" onClick={() => setViewingSnapshot(null)}>
          <div className="snapshot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="snapshot-header">
              <h3>{viewingSnapshot}번 문제 메모</h3>
              <button className="close-btn" onClick={() => setViewingSnapshot(null)}>✕</button>
            </div>
            <div className="snapshot-body">
              {snapshots[viewingSnapshot] ? (
                <>
                  <div className="snapshot-memo">
                    <h4>메모</h4>
                    <p>{snapshots[viewingSnapshot].memo || "(메모 없음)"}</p>
                  </div>
                  <div className="snapshot-drawing">
                    <h4>그림판</h4>
                    {snapshots[viewingSnapshot].canvas ? (
                      <img src={snapshots[viewingSnapshot].canvas} alt={`${viewingSnapshot}번 그림`} />
                    ) : (
                      <p>(그림 없음)</p>
                    )}
                  </div>
                </>
              ) : (
                <p>이 문제를 풀 때 저장된 메모/그림이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
