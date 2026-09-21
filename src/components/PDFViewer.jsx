import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;

export default function PDFViewer() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (numPages && renderedPages === numPages) setLoading(false);
  }, [renderedPages, numPages]);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }
    setFile(f);
    setNumPages(null);
    setScale(1);
    setLoading(true);
    setRenderedPages(0);
    setLoadProgress(0);
  };

  const onDocLoadSuccess = ({ numPages: n }) => {
    setNumPages(n);
    if (n === 0) setLoading(false);
  };

  const onLoadProgress = ({ loaded, total }) => {
    if (total) setLoadProgress(Math.round((loaded / total) * 100));
  };

  const onLoadError = (err) => {
    alert("PDF 파일을 불러오는 데 실패했습니다.");
    console.error(err);
    setLoading(false);
  };

  const setZoom = (v) => {
    if (!file) return;
    setLoading(true);
    setRenderedPages(0);
    setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, v)));
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-header">
        <h2>문제</h2>
        {file && (
          <div className="pdf-controls">
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => setZoom(scale - SCALE_STEP)} disabled={scale <= MIN_SCALE}>-</button>
              <span className="zoom-level">{Math.round(scale * 100)}%</span>
              <button className="zoom-btn" onClick={() => setZoom(scale + SCALE_STEP)} disabled={scale >= MAX_SCALE}>+</button>
              <button className="zoom-reset" onClick={() => setZoom(1)}>초기화</button>
            </div>
          </div>
        )}
        <label htmlFor="pdf-upload" className="upload-btn">PDF 업로드</label>
        <input type="file" accept="application/pdf" onChange={onFileChange} id="pdf-upload" style={{ display: "none" }} />
      </div>
      <div className="pdf-content">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            {loadProgress < 100 ? (
              <p>PDF 파일을 불러오는 중입니다... {loadProgress}%</p>
            ) : (
              <p>페이지를 표시하는 중입니다... ({renderedPages}/{numPages})</p>
            )}
          </div>
        )}
        {file && (
          <div className={`pdf-document-container ${loading ? "loading" : "loaded"}`}>
            <Document
              file={file}
              onLoadSuccess={onDocLoadSuccess}
              onLoadProgress={onLoadProgress}
              onLoadError={onLoadError}
              className="pdf-document"
            >
              {Array.from(new Array(numPages || 0), (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  renderTextLayer
                  renderAnnotationLayer
                  scale={scale}
                  className="pdf-page"
                  onRenderSuccess={() => setRenderedPages((n) => n + 1)}
                />
              ))}
            </Document>
          </div>
        )}
        {!file && !loading && (
          <div className="pdf-placeholder">
            <p>PDF 파일을 업로드해주세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
