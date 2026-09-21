import { useState, useEffect } from "react";

export default function LayoutNotification() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("layout-notification-dismissed")) return;
    const timer = setTimeout(() => {
      setMounted(true);
      setTimeout(() => setVisible(true), 100);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem("layout-notification-dismissed", "true");
    setVisible(false);
    setTimeout(() => setMounted(false), 300);
  };

  if (!mounted) return null;

  return (
    <div className={`layout-notification ${visible ? "visible" : ""}`}>
      <div className="notification-content">
        <div className="notification-icon">🎉</div>
        <div className="notification-text">
          <h3>Changed</h3>
          <p>창을 줄이면 pdf viewer가 사라져요</p>
          <p>마킹과 계산기는 그대로 남아있어요</p>
        </div>
        <div className="notification-actions">
          <button className="dont-show-btn" onClick={dismiss} title="앞으로 이 알림을 보지 않기">알림 그만 보기</button>
        </div>
      </div>
    </div>
  );
}
