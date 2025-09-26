import { useState } from "react";
import "../css/PasswordRecovery.css"

export default function PasswordRecovery({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: solicitar datos, 2: nueva contraseña
  const [recoveryData, setRecoveryData] = useState({
    email: "",
    identification: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRecoveryEmail = async () => {
    const { email, identification } = recoveryData;
    
    // Validaciones
    if (!email || !identification) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Ingrese un correo electrónico válido.");
      return;
    }

    if (!/^[0-9]+$/.test(identification)) {
      alert("La identificación solo puede contener números.");
      return;
    }

    setIsLoading(true);
    
    // Simula envío de correo (aquí iría tu lógica real.ayuda con chat)
    setTimeout(() => {
      setIsLoading(false);
      alert("✅ Se ha enviado un correo de recuperación a su email");
      setStep(2); // Pasar al siguiente paso
    }, 2000);
  };
// Validaciones de inputs
  const handlePasswordReset = () => {
    const { newPassword, confirmPassword } = passwordData;
    
    
    if (!newPassword || !confirmPassword) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Simula cambio de contraseña exitoso
    alert("✅ Contraseña cambiada exitosamente");
    onSuccess && onSuccess();
    onClose && onClose();
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        {step === 1 ? (
          // Paso 1: Solicitar email e identificación
          <div className="recovery-step">
            <h2 className="form-title-large">Recuperar Contraseña</h2>
            <p className="form-subtitle">
              Ingrese su email e identificación para recibir las instrucciones de recuperación
            </p>

            <div className="input-group-large">
              <input
                type="email"
                placeholder="Correo Electrónico"
                className="form-input"
                value={recoveryData.email}
                onChange={(e) =>
                  setRecoveryData({ ...recoveryData, email: e.target.value })
                }
              />
              
              <input
                type="text"
                placeholder="Número de Identificación"
                className="form-input"
                value={recoveryData.identification}
                onChange={(e) =>
                  setRecoveryData({ ...recoveryData, identification: e.target.value })
                }
              />

              <button
                onClick={handleSendRecoveryEmail}
                className="form-button-large"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Correo de Recuperación"}
              </button>
            </div>
          </div>
        ) : (
          // Paso 2: Nueva contraseña
          <div className="recovery-step">
            <div className="step-header">
              <button onClick={handleBackToStep1} className="back-button">
                ←
              </button>
            </div>
            
            <h2 className="form-title-large">Nueva Contraseña</h2>
            <p className="form-subtitle">
              Ingrese su nueva contraseña y confírmela
            </p>

            <div className="input-group-large">
              <input
                type="password"
                placeholder="Nueva Contraseña"
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              
              <input
                type="password"
                placeholder="Confirmar Nueva Contraseña"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />

              <button
                onClick={handlePasswordReset}
                className="form-button-large"
              >
                Cambiar Contraseña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
