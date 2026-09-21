import { useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const OPERATORS = ["+", "-", "×", "÷"];
const SAFE_EXPR = /^[0-9+\-×÷().%\s]+$/;

function evaluate(expr) {
  if (!SAFE_EXPR.test(expr)) return "Error";
  const jsExpr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/%/g, "/100");
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${jsExpr})`)();
    if (!Number.isFinite(result)) return "Error";
    return String(Math.round(result * 1e10) / 1e10);
  } catch {
    return "Error";
  }
}

export default function Calculator() {
  const [display, setDisplay] = useLocalStorage("skct-calc-display", "0");
  const [isResultShown, setIsResultShown] = useLocalStorage("skct-calc-result-shown", false);

  const handleNumber = (digit) => {
    setDisplay((d) => (isResultShown || d === "0" || d === "Error" ? digit : d + digit));
    setIsResultShown(false);
  };

  const handleOperator = (op) => {
    setDisplay((d) => {
      if (d === "Error") return op === "-" ? "-" : "0";
      const last = d.slice(-1);
      if (OPERATORS.includes(last)) return d.slice(0, -1) + op;
      return d + op;
    });
    setIsResultShown(false);
  };

  const handleParenthesis = (p) => {
    setDisplay((d) => (isResultShown || d === "0" || d === "Error" ? p : d + p));
    setIsResultShown(false);
  };

  const handleDecimal = () => {
    setDisplay((d) => {
      const segments = d.split(/[+\-×÷()]/);
      const last = segments[segments.length - 1];
      if (last.includes(".")) return d;
      return (isResultShown || d === "0" || d === "Error" ? "0" : d) + ".";
    });
    setIsResultShown(false);
  };

  const handlePercent = () => {
    setDisplay((d) => (d === "Error" ? "0" : d + "%"));
    setIsResultShown(false);
  };

  const handleEquals = () => {
    setDisplay((d) => evaluate(d));
    setIsResultShown(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setIsResultShown(false);
  };

  const handleBackspace = () => {
    if (isResultShown || display === "Error") {
      handleClear();
      return;
    }
    setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1)));
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e;
      if (key >= "0" && key <= "9") handleNumber(key);
      else if (["+", "-", "*", "/"].includes(key)) {
        e.preventDefault();
        handleOperator(key === "*" ? "×" : key === "/" ? "÷" : key);
      } else if (key === "(" || key === ")") handleParenthesis(key);
      else if (key === ".") handleDecimal();
      else if (key === "%") handlePercent();
      else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (key === "Backspace") handleBackspace();
      else if (key.toLowerCase() === "c" || key === "Escape") handleClear();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, isResultShown]);

  return (
    <div className="calculator" onKeyDown={(e) => e.stopPropagation()}>
      <div className="calc-display">{display}</div>
      <div className="calc-buttons">
        <button className="calc-btn calc-fn" onClick={handleClear}>C</button>
        <button className="calc-btn calc-fn" onClick={() => handleParenthesis("(")}>(</button>
        <button className="calc-btn calc-fn" onClick={() => handleParenthesis(")")}>)</button>
        <button className="calc-btn calc-op" onClick={() => handleOperator("÷")}>÷</button>

        <button className="calc-btn" onClick={() => handleNumber("7")}>7</button>
        <button className="calc-btn" onClick={() => handleNumber("8")}>8</button>
        <button className="calc-btn" onClick={() => handleNumber("9")}>9</button>
        <button className="calc-btn calc-op" onClick={() => handleOperator("×")}>×</button>

        <button className="calc-btn" onClick={() => handleNumber("4")}>4</button>
        <button className="calc-btn" onClick={() => handleNumber("5")}>5</button>
        <button className="calc-btn" onClick={() => handleNumber("6")}>6</button>
        <button className="calc-btn calc-op" onClick={() => handleOperator("-")}>-</button>

        <button className="calc-btn" onClick={() => handleNumber("1")}>1</button>
        <button className="calc-btn" onClick={() => handleNumber("2")}>2</button>
        <button className="calc-btn" onClick={() => handleNumber("3")}>3</button>
        <button className="calc-btn calc-op" onClick={() => handleOperator("+")}>+</button>

        <button className="calc-btn" onClick={() => handleNumber("0")}>0</button>
        <button className="calc-btn" onClick={handleDecimal}>.</button>
        <button className="calc-btn calc-fn" onClick={handleBackspace}>⌫</button>
        <button className="calc-btn calc-equals" onClick={handleEquals}>=</button>
      </div>
    </div>
  );
}
