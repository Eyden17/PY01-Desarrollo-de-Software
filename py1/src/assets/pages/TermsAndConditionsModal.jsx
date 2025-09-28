import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import "../css/TermsAndConditionsModal.css";



export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.2);

  const handleAcceptTerms = () => {
    if (hasAccepted) {
      onAccept();
      onClose();
      setHasAccepted(false);
      resetPDFState();
    } else {
      alert("Debe marcar la casilla de aceptación para continuar.");
    }
  };

  const handleClose = () => {
    onClose();
    setHasAccepted(false);
    resetPDFState();
  };

  const resetPDFState = () => {
    setPageNumber(1);
    setNumPages(null);
    setLoading(true);
    setError(null);
    setScale(1.2);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Error al cargar el PDF');
    setLoading(false);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.2);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container google-style" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="google-header">
          <div className="header-left">
            <h2 className="document-title">Términos y Condiciones</h2>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={handleClose} title="Cerrar">✕</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="google-toolbar">
          <div className="toolbar-left">
            <div className="page-controls">
              <button className="toolbar-btn" onClick={goToPrevPage} disabled={pageNumber <= 1}>◀</button>
              <div className="page-input-container">
                <input
                  type="text"
                  value={pageNumber}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= (numPages || 1)) setPageNumber(page);
                  }}
                  className="page-input"
                />
                <span className="page-separator">/ {numPages || 1}</span>
              </div>
              <button className="toolbar-btn" onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>▶</button>
            </div>
          </div>

          <div className="toolbar-center">
            <div className="zoom-controls">
              <button className="toolbar-btn" onClick={zoomOut}>−</button>
              <button className="toolbar-btn zoom-display" onClick={resetZoom}>{Math.round(scale * 100)}%</button>
              <button className="toolbar-btn" onClick={zoomIn}>+</button>
            </div>
          </div>

          <div className="toolbar-right">
            <a href="/assets/pdf/Astralis.pdf" target="_blank" rel="noopener noreferrer" className="toolbar-btn">📄</a>
            <a href="/assets/pdf/Astralis.pdf" download="terminos-condiciones.pdf" className="toolbar-btn">⬇</a>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="google-content">
          <div className="sidebar">
            <div className="sidebar-header">
              <button className="sidebar-toggle">☰</button>
            </div>
            <div className="thumbnails">
              {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(page => (
                <div
                  key={page}
                  className={`thumbnail ${page === pageNumber ? 'active' : ''}`}
                  onClick={() => setPageNumber(page)}
                >
                  <Document file="/assets/pdf/Astralis.pdf">
                    <Page 
                      pageNumber={page} 
                      scale={0.15} 
                      className="thumbnail-page"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                  <div className="thumbnail-number">{page}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="main-viewer">
            {loading && (
              <div className="pdf-loading">
                <div className="loading-spinner"></div>
                <p>Cargando documento...</p>
              </div>
            )}

            {error && (
              <div className="pdf-error">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <div className="error-actions">
                  <a href="/assets/pdf/Astralis.pdf" target="_blank" rel="noopener noreferrer" className="error-link">Abrir PDF en nueva pestaña</a>
                </div>
              </div>
            )}

            {!error && (
              <div className="pdf-viewer-main">
                <Document
                  file="/assets/pdf/Astralis.pdf"
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  className="pdf-document-main"
                  options={{
                    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                    cMapPacked: true,
                    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                  }}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    className="pdf-page-main"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="google-footer">
          <div className="terms-section">
            <label className="checkbox-container">
              <input type="checkbox" checked={hasAccepted} onChange={e => setHasAccepted(e.target.checked)} className="terms-checkbox" />
              <span className="checkmark"></span>
              <span className="terms-text">He leído y acepto los términos y condiciones del servicio bancario</span>
            </label>
          </div>

          <div className="footer-actions">
            <button className="btn-cancel-google" onClick={handleClose}>Cancelar</button>
            <button className={`btn-accept-google ${!hasAccepted ? 'disabled' : ''}`} onClick={handleAcceptTerms} disabled={!hasAccepted}>Aceptar</button>
          </div>
        </div>

      </div>
    </div>
  );
}