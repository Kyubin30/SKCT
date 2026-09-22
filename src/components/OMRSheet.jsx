import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const QUESTION_COUNT = 100;
const CHOICES = [1, 2, 3, 4, 5];
const QUESTION_NUMBERS = Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1);

export default function OMRSheet({ onGradingToggle, activeRange }) {
  const [answers, setAnswers] = useLocalStorage("skct-omr-answers", {});
  const [gradingInput, setGradingInput] = useState("");
  const [gradingResult, setGradingResult] = useState(null);
  const [gradingMode, setGradingMode] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  useEffect(() => {
    onGradingToggle?.(gradingMode);
  }, [gradingMode, onGradingToggle]);

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
    const wrong = [];
    key.forEach((correctAnswer, idx) => {
      const questionNum = idx + 1;
      if (answers[questionNum] === correctAnswer) correct++;
      else wrong.push({ questionNum, userAnswer: answers[questionNum] || "미답", correctAnswer });
    });
    setWrongAnswers(wrong);
    setGradingResult({ correct, total: key.length, percentage: ((correct / key.length) * 100).toFixed(1) });
  };

  const clearAll = () => {
    if (window.confirm("모든 답안을 지우시겠습니까?")) {
      setAnswers({});
      setGradingResult(null);
      setWrongAnswers([]);
    }
  };

  const clearGradingInput = () => {
    setGradingInput("");
    setGradingResult(null);
    setWrongAnswers([]);
  };

  const filterGradingKeydown = (e) => {
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
              {wrongAnswers.length > 0 && (
                <div className="wrong-questions-detail">
                  <h4>틀린 문제 상세 ({wrongAnswers.length}개)</h4>
                  <div className="wrong-questions-list">
                    {wrongAnswers.map((w) => (
                      <div className="wrong-question-item" key={w.questionNum}>
                        <div className="question-info">
                          <span className="question-number">{w.questionNum}번</span>
                          <div className="answer-comparison">
                            <span className="user-answer">내 답: {w.userAnswer}</span>
                            <span className="arrow">→</span>
                            <span className="correct-answer">정답: {w.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="question-number">{num}</div>
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
    </div>
  );
}
