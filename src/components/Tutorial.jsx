import { forwardRef, useState, useImperativeHandle } from "react";

const Tutorial = forwardRef((_, ref) => {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({ open: () => setVisible(true) }));

  const dismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <h2>SKCT 시험창 사용 설명서</h2>
          <button className="close-btn" onClick={dismiss}>✕</button>
        </div>
        <div className="tutorial-content">
          <div className="tutorial-section">
            <div className="section-icon">📄</div>
            <h3>PDF 문제 업로드</h3>
            <p>"PDF 업로드" 버튼으로 문제 PDF를 업로드하세요. 페이지는 세로로 이어서 스크롤하며 볼 수 있습니다.</p>
          </div>
          <div className="tutorial-section">
            <div className="section-icon">⏱️</div>
            <h3>타이머 사용</h3>
            <p>시작 / 정지 / 리셋 버튼으로 경과 시간을 기록할 수 있습니다.</p>
          </div>
          <div className="tutorial-section">
            <div className="section-icon">✏️</div>
            <h3>OMR 답안 작성</h3>
            <p>1~100번 문항에 대해 1~5번 중 답을 클릭해 표시하세요. 같은 번호를 다시 클릭하면 선택이 해제됩니다. 우측 탭으로 OMR을 숨기거나 보이게 할 수 있습니다.</p>
          </div>
          <div className="tutorial-section">
            <div className="section-icon">✅</div>
            <h3>채점하기</h3>
            <p>"채점하기" 버튼을 누르고 정답을 쉼표 또는 공백으로 구분해 입력하면 정답/오답/점수를 확인할 수 있습니다.</p>
          </div>
          <div className="tutorial-section">
            <div className="section-icon">🧮</div>
            <h3>계산기</h3>
            <p>기본적인 사칙연산을 지원하는 계산기입니다. 키보드로도 입력할 수 있습니다.</p>
          </div>
          <div className="tutorial-section">
            <div className="section-icon">📝</div>
            <h3>메모장 / 그림판</h3>
            <p>메모장과 그림판을 탭으로 전환하며 사용할 수 있습니다. 색상과 선 굵기를 조절할 수 있고, "전체 지우기"로 그림판을 비울 수 있습니다.</p>
          </div>
          <div className="tutorial-footer-info">
            <p>🎯 학습 팁: 계산기, 메모, 그림판, OMR 답안은 자동으로 저장되어 창을 새로고침하거나 크기를 바꿔도 유지됩니다. 각 도구의 초기화 버튼으로 직접 지울 수 있습니다.</p>
          </div>
        </div>
        <div className="tutorial-footer">
          <button className="btn-secondary" onClick={dismiss}>나중에 보기</button>
          <button className="btn-primary" onClick={dismiss}>다시 보지 않기</button>
        </div>
      </div>
    </div>
  );
});

Tutorial.displayName = "Tutorial";

export default Tutorial;
