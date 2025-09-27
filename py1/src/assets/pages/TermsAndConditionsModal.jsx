import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import "../css/TermsAndConditionsModal.css";

// Configurar worker para React-PDF v6.2.2
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.2);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container google-style" onClick={(e) => e.stopPropagation()}>
        
        {/* Header estilo Google Drive */}
        <div className="google-header">
          <div className="header-left">
            <h2 className="document-title">Términos y Condiciones</h2>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={handleClose} title="Cerrar">
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar estilo Google */}
        <div className="google-toolbar">
          <div className="toolbar-left">
            <div className="page-controls">
              <button 
                className="toolbar-btn" 
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                title="Página anterior"
              >
                ◀
              </button>
              <div className="page-input-container">
                <input 
                  type="text" 
                  value={pageNumber}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= (numPages || 1)) {
                      setPageNumber(page);
                    }
                  }}
                  className="page-input"
                />
                <span className="page-separator">/ {numPages || 1}</span>
              </div>
              <button 
                className="toolbar-btn"
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                title="Página siguiente"
              >
                ▶
              </button>
            </div>
          </div>

          <div className="toolbar-center">
            <div className="zoom-controls">
              <button className="toolbar-btn" onClick={zoomOut} title="Alejar">
                −
              </button>
              <button className="toolbar-btn zoom-display" onClick={resetZoom} title="Restablecer zoom">
                {Math.round(scale * 100)}%
              </button>
              <button className="toolbar-btn" onClick={zoomIn} title="Acercar">
                +
              </button>
            </div>
          </div>

          <div className="toolbar-right">
            <a 
              href="/assets/pdf/astralis.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="toolbar-btn"
              title="Abrir en nueva pestaña"
            >
              📄
            </a>
            <a 
              href="/assets/pdf/astralis.pdf" 
              download="terminos-condiciones.pdf"
              className="toolbar-btn"
              title="Descargar"
            >
              ⬇
            </a>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="google-content">
          
          {/* Sidebar con miniaturas */}
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
                  <Document
                    file="/assets/pdf/astralis.pdf"
                    loading=""
                    error=""
                  >
                    <Page
                      pageNumber={page}
                      scale={0.15}
                      loading=""
                      className="thumbnail-page"
                    />
                  </Document>
                  <div className="thumbnail-number">{page}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visor principal */}
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
                  <a 
                    href="/assets/pdf/astralis.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="error-link"
                  >
                    Abrir PDF en nueva pestaña
                  </a>
                </div>
              </div>
            )}

            {!error && (
              <div className="pdf-viewer-main">
                <Document
                  file="/assets/pdf/astralis.pdf"
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                  error=""
                  className="pdf-document-main"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    loading=""
                    className="pdf-page-main"
                  />
                </Document>
              </div>
            )}
          </div>
        </div>

        {/* Footer con términos */}
        <div className="google-footer">
          <div className="terms-section">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="terms-checkbox"
              />
              <span className="checkmark"></span>
              <span className="terms-text">
                He leído y acepto los términos y condiciones del servicio bancario
              </span>
            </label>
          </div>
          
          <div className="footer-actions">
            <button className="btn-cancel-google" onClick={handleClose}>
              Cancelar
            </button>
            <button 
              className={`btn-accept-google ${!hasAccepted ? 'disabled' : ''}`}
              onClick={handleAcceptTerms}
              disabled={!hasAccepted}
            >
              Aceptar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}