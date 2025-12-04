import { useEffect } from "react";
import "../css/Messages.css";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

/**
 * Componente de mensajes para mostrar alertas de éxito, error, info o advertencia
 */
export default function Messages({ 
  show = false,  
  text,          
  type = "info", 
  onClose, 
  duration = 5000,
  autoClose = true 
}) {
  
  useEffect(() => {
    if (show && autoClose && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  // No renderizar si show es false
  if (!show) return null;

  // Determinar el ícono según el tipo
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="message-icon" />;
      case "error":
        return <FaExclamationTriangle className="message-icon" />;
      case "warning":
        return <FaExclamationTriangle className="message-icon" />;
      case "info":
      default:
        return <FaInfoCircle className="message-icon" />;
    }
  };

  return (
    <div className={`message-container message-${type}`}>
      <div className="message-content">
        {getIcon()}
        <p className="message-text">{text}</p>
      </div>
      
      {onClose && (
        <button 
          className="message-close-btn" 
          onClick={onClose}
          aria-label="Cerrar mensaje"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}