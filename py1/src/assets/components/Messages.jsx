import { useEffect } from "react";
import "../css/Messages.css";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

/**
 * Componente de mensajes para mostrar alertas de éxito, error, info o advertencia
 */
export default function Messages({ 
  message, 
  type = "info", 
  onClose, 
  duration = 5000,
  autoClose = true 
}) {
  
  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

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
        <p className="message-text">{message}</p>
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
