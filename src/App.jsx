import { useState, useRef, useEffect } from "react";
import Tutorial from "./components/Tutorial";
import PDFViewer from "./components/PDFViewer";
import OMRSheet from "./components/OMRSheet";
import Timer from "./components/Timer";
import NotePad from "./components/NotePad";
import Calculator from "./components/Calculator";
import "./App.css";

export default function App() {
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
      <div className={`app ${narrow ? "narrow-screen" : ""}`}>
        <button className="help-btn" onClick={() => tutorialRef.current?.open()} title="사용 설명서 보기">❓</button>

        <div className="middle-panel">
          <PDFViewer />
        </div>

        <div className="omr-container">
          <div className={`omr-panel ${gradingMode ? "grading-mode" : ""}`}>
            <OMRSheet onGradingToggle={setGradingMode} />
          </div>
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
