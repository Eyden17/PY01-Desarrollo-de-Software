import { useEffect, useState } from "react";
import "../css/modal.css";

export default function PinModal({ card, onClose }) {
  const [step, setStep] = useState(1); // Paso 1: OTP, Paso 2: mostrar PIN
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [timer, setTimer] = useState(0);

  // Validar OTP
  const handleVerifyOtp = () => {
    setStatus("loading");
    setTimeout(() => {
      if (otp === "123456") { // OTP simulado
        setStep(2);
        setStatus("success");
        setTimer(10); // 10 segundos de visualización
      } else {
        setStatus("error");
      }
    }, 1000);
  };

  // Temporizador para autoocultar PIN
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && step === 2) {
      onClose();
    }
  }, [timer, step, onClose]);

  const copyPin = () => {
    navigator.clipboard.writeText(card.pin);
    alert("PIN copiado al portapapeles");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Consultar PIN</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        {step === 1 && (
          <div className="modal-account-info">
            <p>Ingrese el código de verificación enviado por correo/SMS:</p>
            <input
              type="text"
              placeholder="Código OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp} disabled={status === "loading"}>
              {status === "loading" ? "Verificando..." : "Verificar"}
            </button>
            {status === "error" && <p className="error">El código no es válido o ha expirado.</p>}
          </div>
        )}

        {step === 2 && (
          <div className="modal-account-info">
            <p><strong>Tarjeta:</strong> {card.type} **** **** **** {card.number.slice(-4)}</p>
            <p><strong>CVV:</strong> {card.cvv}</p>
            <p><strong>PIN:</strong> {card.pin}</p>
            <p>Se ocultará en {timer} segundos</p>
            <button onClick={copyPin}>Copiar PIN</button>
          </div>
        )}
      </div>
    </div>
  );
}
