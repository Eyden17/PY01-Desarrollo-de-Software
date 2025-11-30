import { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/css/PasswordRecovery.css";

export default function PasswordRecovery({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: método, 2: código, 3: nueva contraseña, 4: confirmación
  const [recoveryMethod, setRecoveryMethod] = useState(''); // 'username' o 'email'
  const [identifier, setIdentifier] = useState(''); // username o email ingresado
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Código de verificación simulado para demo
  const DEMO_CODE = '123456';

  const handleMethodSelection = () => {
    if (!recoveryMethod) {
      alert('Por favor seleccione un método de recuperación');
      return;
    }
    if (!identifier.trim()) {
      alert(`Por favor ingrese su ${recoveryMethod === 'username' ? 'usuario' : 'correo electrónico'}`);
      return;
    }

    // Valida formato de email si se eligió email
    if (recoveryMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    
    // Simula envío de código
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      alert(`Se ha enviado un código de verificación a su ${recoveryMethod === 'username' ? 'correo registrado' : 'correo electrónico'}`);
    }, 2000);
  };

  const handleCodeVerification = () => {
    if (!verificationCode.trim()) {
      alert('Por favor ingrese el código de verificación');
      return;
    }

    if (verificationCode !== DEMO_CODE) {
      alert('Código de verificación incorrecto. Intente nuevamente.');
      return;
    }

    setStep(3);
  };

  const handlePasswordReset = () => {
    if (!newPassword || !confirmPassword) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Validación de contraseña
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      alert('La contraseña debe tener mínimo 8 caracteres, incluir al menos una mayúscula, una minúscula y un número.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    
    // Simular cambio de contraseña
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 2000);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  const handleResendCode = () => {
    alert('Se ha reenviado el código de verificación');
  };

  return (
    <div className="password-recovery-overlay">
      <div className="password-recovery-modal">
        <div className="password-recovery-header">
          <h2 className="password-recovery-title">
            {step === 1 && 'Recuperar Contraseña'}
            {step === 2 && 'Verificación de Código'}
            {step === 3 && 'Nueva Contraseña'}
            {step === 4 && 'Recuperación Exitosa'}
          </h2>
          <button onClick={onClose} className="password-recovery-close">×</button>
        </div>

        <div className="password-recovery-content">
          {/* Paso 1: Seleccionar método de recuperación */}
          {step === 1 && (
            <>
              <p className="password-recovery-description">
                Seleccione cómo desea recuperar su contraseña:
              </p>
              
              <div className="password-recovery-radio-group">
                <label 
                  className={`password-recovery-radio-label ${recoveryMethod === 'username' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="recoveryMethod"
                    value="username"
                    checked={recoveryMethod === 'username'}
                    onChange={(e) => setRecoveryMethod(e.target.value)}
                    className="password-recovery-radio"
                  />
                  Por nombre de usuario
                </label>
                
                <label 
                  className={`password-recovery-radio-label ${recoveryMethod === 'email' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="recoveryMethod"
                    value="email"
                    checked={recoveryMethod === 'email'}
                    onChange={(e) => setRecoveryMethod(e.target.value)}
                    className="password-recovery-radio"
                  />
                  Por correo electrónico
                </label>
              </div>

              {recoveryMethod && (
                <div className="password-recovery-input-group">
                  <input
                    type={recoveryMethod === 'email' ? 'email' : 'text'}
                    placeholder={recoveryMethod === 'username' ? 'Ingrese su usuario' : 'Ingrese su correo electrónico'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="password-recovery-input"
                  />
                </div>
              )}

              <button
                onClick={handleMethodSelection}
                disabled={isLoading}
                className="password-recovery-button"
                style={{ opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? 'Enviando...' : 'Enviar Código de Verificación'}
              </button>
            </>
          )}

          {/* Paso 2: Ingreso de código de verificación */}
          {step === 2 && (
            <>
              <p className="password-recovery-description">
                Se ha enviado un código de verificación a su correo electrónico.
                <br />
                <small className="password-recovery-small-text">
                  (Para esta demo, use el código: <strong>123456</strong>)
                </small>
              </p>
              
              <div className="password-recovery-input-group">
                <input
                  type="text"
                  placeholder="Ingrese el código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="password-recovery-input password-recovery-code-input"
                  maxLength="6"
                />
              </div>

              <div className="password-recovery-button-group">
                <button onClick={handleCodeVerification} className="password-recovery-button">
                  Verificar Código
                </button>
                <button onClick={handleResendCode} className="password-recovery-secondary-button">
                  Reenviar Código
                </button>
              </div>
            </>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <>
              <p className="password-recovery-description">
                Ingrese su nueva contraseña:
              </p>
              
              <div className="password-recovery-input-group">
                <div className="password-recovery-password-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="password-recovery-input password-recovery-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="password-recovery-toggle-btn"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                <div className="password-recovery-password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="password-recovery-input password-recovery-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-recovery-toggle-btn"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="password-recovery-requirements">
                <small>
                  La contraseña debe tener:
                  <br />• Mínimo 8 caracteres
                  <br />• Al menos una letra mayúscula
                  <br />• Al menos una letra minúscula
                  <br />• Al menos un número
                </small>
              </div>

              <button
                onClick={handlePasswordReset}
                disabled={isLoading}
                className="password-recovery-button"
                style={{ opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </>
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
            <>
              <div className="password-recovery-success-icon">✅</div>
              <p className="password-recovery-success-message">
                ¡Contraseña actualizada exitosamente!
              </p>
              <p className="password-recovery-description">
                Su contraseña ha sido cambiada correctamente. Ahora puede iniciar sesión con su nueva contraseña.
              </p>

              <button onClick={handleFinish} className="password-recovery-button">
                Ir a Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}