import { useState } from "react";
import "../css/TermsAndConditionsModal.css";

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }) {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAcceptTerms = () => {
    if (hasAccepted) {
      onAccept();
      onClose();
      setHasAccepted(false);
    } else {
      alert("Debe marcar la casilla de aceptación para continuar.");
    }
  };

  const handleClose = () => {
    onClose();
    setHasAccepted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Términos y Condiciones</h2>
          <button className="close-btn" onClick={handleClose} title="Cerrar">
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="modal-toolbar">
          <div className="toolbar-left">
            <span className="document-label">Documento PDF</span>
          </div>
          
          <div className="toolbar-right">
            <a 
              href="/assets/pdf/Astralis.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="toolbar-link"
            >
              📄 Abrir en nueva pestaña
            </a>
            <a 
              href="/assets/pdf/Astralis.pdf" 
              download="terminos-condiciones.pdf"
              className="toolbar-link"
            >
              ⬇ Descargar
            </a>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="pdf-container">
          <embed
            src="/assets/pdf/Astralis.pdf"
            type="application/pdf"
            width="100%"
            height="100%"
            className="pdf-embed"
          />
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="terms-section">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={hasAccepted} 
                onChange={e => setHasAccepted(e.target.checked)}
                className="terms-checkbox"
              />
              <span className="terms-text">
                He leído y acepto los términos y condiciones del servicio bancario
              </span>
            </label>
          </div>

          <div className="button-group">
            <button className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button 
              className={`btn-accept ${!hasAccepted ? 'disabled' : ''}`}
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