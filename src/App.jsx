import { useState, useRef, useEffect } from "react";
import Tutorial from "./components/Tutorial";
import LayoutNotification from "./components/LayoutNotification";
import PDFViewer from "./components/PDFViewer";
import OMRSheet from "./components/OMRSheet";
import Timer from "./components/Timer";
import NotePad from "./components/NotePad";
import Calculator from "./components/Calculator";
import "./App.css";

export default function App() {
  const [omrVisible, setOmrVisible] = useState(true);
  const tutorialRef = useRef();
  const [gradingMode, setGradingMode] = useState(false);
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 768px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <Tutorial ref={tutorialRef} />
      <LayoutNotification />
      <div className={`app ${narrow ? "narrow-screen" : ""}`}>
        <button className="help-btn" onClick={() => tutorialRef.current?.open()} title="사용 설명서 보기">❓</button>

        <div className="middle-panel">
          <PDFViewer />
        </div>

        <div className="omr-container">
          {omrVisible && (
            <div className={`omr-panel ${gradingMode ? "grading-mode" : ""}`}>
              <OMRSheet onGradingToggle={setGradingMode} />
            </div>
          )}
          <button className="omr-toggle-btn" onClick={() => setOmrVisible((v) => !v)}>
            {omrVisible ? "▼ OMR 숨기기" : "OMR 보이기 ▲"}
          </button>
        </div>

        <div className={`right-panel ${narrow ? "expanded" : ""}`}>
          <div className="timer-section">
            <Timer />
          </div>
          <div className="notepad-section">
            <NotePad />
          </div>
          <div className="calculator-section">
            <Calculator />
          </div>
        </div>
      </div>
    </>
  );
}
