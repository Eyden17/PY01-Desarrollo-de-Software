import React, { useState } from 'react';
import '../assets/css/Transfers.css';

const Transfers = ({ userAccounts = [], onClose }) => {
  const [step, setStep] = useState('select'); // 'select', 'form', 'confirm', 'result'
  const [transferType, setTransferType] = useState(null); // 'own', 'third-party'
  const [formData, setFormData] = useState({
    sourceAccount: '',
    destinationAccount: '',
    currency: '',
    amount: '',
    description: ''
  });
  const [destinationAccountInfo, setDestinationAccountInfo] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Simula validación de cuenta de terceros
  const validateThirdPartyAccount = async (accountNumber) => {
    setIsValidating(true);
    // Simulación - en producción sería una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAccounts = {
          '1234567890': { name: 'Juan Pérez González', accountType: 'Ahorro' },
          '0987654321': { name: 'María Rodríguez López', accountType: 'Corriente' },
          '5555555555': { name: 'Carlos Mora Jiménez', accountType: 'Ahorro' }
        };
        
        setIsValidating(false);
        if (mockAccounts[accountNumber]) {
          resolve({ success: true, data: mockAccounts[accountNumber] });
        } else {
          resolve({ success: false, error: 'Cuenta no encontrada' });
        }
      }, 1000);
    });
  };

  const handleTransferTypeSelect = (type) => {
    setTransferType(type);
    setStep('form');
    setFormData({
      sourceAccount: '',
      destinationAccount: '',
      currency: '',
      amount: '',
      description: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpia el error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-selecciona un moneda cuando se elige cuenta origen
    if (name === 'sourceAccount' && !formData.currency) {
      const account = userAccounts.find(acc => acc.id === value);
      if (account) {
        setFormData(prev => ({ ...prev, currency: account.currency }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sourceAccount) {
      newErrors.sourceAccount = 'Selecciona una cuenta de origen';
    }
    
    if (!formData.destinationAccount) {
      newErrors.destinationAccount = 'Selecciona o ingresa una cuenta de destino';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    }
    
    if (!formData.currency) {
      newErrors.currency = 'Selecciona una moneda';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'La descripción no puede exceder 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    // Si es transferencia a terceros, validar la cuenta
    if (transferType === 'third-party') {
      const result = await validateThirdPartyAccount(formData.destinationAccount);
      
      if (!result.success) {
        setErrors({ destinationAccount: result.error });
        return;
      }
      
      setDestinationAccountInfo(result.data);
    }

    setStep('confirm');
  };

  const handleConfirmTransfer = () => {
    // Simulamos procesamiento de transferencia
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% éxito
      
      setTransferResult({
        success,
        transactionId: `TXN${Date.now()}`,
        date: new Date().toLocaleString('es-CR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      });
      
      setStep('result');
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    // Placeholder para descargar(py02) el comprobante
    alert('Función de descarga disponible próximamente');
  };

  const handleNewTransfer = () => {
    setStep('select');
    setTransferType(null);
    setFormData({
      sourceAccount: '',
      destinationAccount: '',
      currency: '',
      amount: '',
      description: ''
    });
    setDestinationAccountInfo(null);
    setTransferResult(null);
    setErrors({});
  };

  const getAccountName = (accountId) => {
    const account = userAccounts.find(acc => acc.id === accountId);
    return account ? `${account.name} - ${account.number}` : '';
  };

  const getAvailableDestinationAccounts = () => {
    return userAccounts.filter(acc => acc.id !== formData.sourceAccount);
  };

  const isFormValid = () => {
    return formData.sourceAccount && 
           formData.destinationAccount && 
           formData.amount && 
           parseFloat(formData.amount) > 0 && 
           formData.currency;
  };

  return (
    <div className="transfers-modal-overlay">
      <div className="transfers-modal">
        <div className="transfers-modal-header">
          <h2>Transferencias</h2>
          <button 
            className="transfers-close-btn" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="transfers-modal-body">
          {/* Paso 1: Selección de tipo */}
          {step === 'select' && (
            <div className="transfers-type-selection">
              <p className="transfers-instruction">Selecciona el tipo de transferencia:</p>
              <div className="transfers-type-cards">
                <button 
                  className="transfer-type-card"
                  onClick={() => handleTransferTypeSelect('own')}
                >
                  
                  <h3>Cuentas Propias</h3>
                  <p>Transfiere entre tus propias cuentas</p>
                </button>
                
                <button 
                  className="transfer-type-card"
                  onClick={() => handleTransferTypeSelect('third-party')}
                >
                  <h3>Terceros</h3>
                  <p>Transfiere a otras personas del mismo banco</p>
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Formulario */}
          {step === 'form' && (
            <div className="transfers-form">
              <div className="transfer-type-badge">
                {transferType === 'own' ? 'Cuentas Propias' : 'Terceros'}
              </div>
                {/* Seleccione una cuenta origen*/}
              <div className="form-group">
                <label htmlFor="sourceAccount">Cuenta Origen *</label>
                <select
                  id="sourceAccount"
                  name="sourceAccount"
                  value={formData.sourceAccount}
                  onChange={handleInputChange}
                  className={errors.sourceAccount ? 'error' : ''}
                >
                    <option value="" disabled hidden>Selecciona una cuenta</option>
                  {userAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.number} ({account.currency} {account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
                {errors.sourceAccount && <span className="error-message">{errors.sourceAccount}</span>}
              </div>
                {/* Seleccione una cuenta destino */}
              <div className="form-group">
                <label htmlFor="destinationAccount">Cuenta Destino *</label>
                {transferType === 'own' ? (
                  <select
                    id="destinationAccount"
                    name="destinationAccount"
                    value={formData.destinationAccount}
                    onChange={handleInputChange}
                    className={errors.destinationAccount ? 'error' : ''}
                    disabled={!formData.sourceAccount}
                  >
                   <option value="" disabled hidden>Selecciona una cuenta</option>
                    {getAvailableDestinationAccounts().map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.number}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="destinationAccount"
                    name="destinationAccount"
                    value={formData.destinationAccount}
                    onChange={handleInputChange}
                    placeholder="Ingresa el número de cuenta"
                    className={errors.destinationAccount ? 'error' : ''}
                    maxLength="20"
                  />
                )}
                {errors.destinationAccount && <span className="error-message">{errors.destinationAccount}</span>}
                {isValidating && <span className="info-message">Validando cuenta...</span>}
              </div>
                {/* Moneda */}
              <div className="form-group">
                <label htmlFor="currency">Moneda *</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={errors.currency ? 'error' : ''}
                >
                 <option value="" disabled hidden>Selecciona moneda</option>
                  <option value="CRC">CRC - Colones</option>
                  <option value="USD">USD - Dólares</option>
                </select>
                {errors.currency && <span className="error-message">{errors.currency}</span>}
              </div>
                 {/* Monto */}
              <div className="form-group">
                <label htmlFor="amount">Monto *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.amount ? 'error' : ''}
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>
                 {/* Descipcion */}
              <div className="form-group">
                <label htmlFor="description">Descripción (opcional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Agrega una descripción..."
                  maxLength="255"
                  rows="3"
                  className={errors.description ? 'error' : ''}
                />
                <span className="char-count">{formData.description.length}/255</span>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
                {/* Boton de Atrás */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setStep('select')}
                >
                  Atrás
                </button>
                {/* Boton de Continuar */}
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleContinue}
                  disabled={!isFormValid() || isValidating}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación 
            *Aqui aparecera los datos registrados anteriormente.
            */}
          {step === 'confirm' && (
            <div className="transfers-confirm">
              <h3>Confirmar Transferencia</h3>
              <p className="confirm-subtitle">Verifica los datos antes de confirmar</p>
               {/* div:confirm-details:  es el contenedor de la informacion*/}
              <div className="confirm-details">
                {/* div:confirm-item: es el dato que aparece en el contenedor(tipo,desde,hacia,etc) */}
                <div className="confirm-item">
                  <span className="confirm-label">Tipo:</span>
                  <span className="confirm-value">
                    {transferType === 'own' ? 'Cuentas Propias' : 'Terceros'}
                  </span>
                </div>
                {/* Desde */}
                <div className="confirm-item">
                  <span className="confirm-label">Desde:</span>
                  <span className="confirm-value">{getAccountName(formData.sourceAccount)}</span>
                </div>
                  {/* Hacia */}
                <div className="confirm-item">
                  <span className="confirm-label">Hacia:</span>
                  <span className="confirm-value">
                    {transferType === 'own' 
                      ? getAccountName(formData.destinationAccount)
                      : `${formData.destinationAccount} - ${destinationAccountInfo?.name}`
                    }
                  </span>
                </div>
                     {/* Monto */}
                <div className="confirm-item">
                  <span className="confirm-label">Monto:</span>
                  <span className="confirm-value highlight">
                    {formData.currency} {parseFloat(formData.amount).toFixed(2)}
                  </span>
                </div>

                {formData.description && (
                  <div className="confirm-item">
                     {/* Descripción */}
                    <span className="confirm-label">Descripción:</span>
                    <span className="confirm-value">{formData.description}</span>
                  </div>
                )}
                {/* Fecha */}
                <div className="confirm-item">
                  <span className="confirm-label">Fecha:</span>
                  <span className="confirm-value">
                    {new Date().toLocaleString('es-CR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
                    {/* Botones(modificar/Conrmar) */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setStep('form')}
                >
                  Modificar
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleConfirmTransfer}
                >
                  Confirmar Transferencia
                </button>
              </div>
            </div>
          )}

          {/* Paso 4: Resultado */}
          {step === 'result' && transferResult && (
            <div className="transfers-result">
              <div className={`result-icon ${transferResult.success ? 'success' : 'error'}`}>
                {transferResult.success ? '✓' : '✕'}
              </div>
              
              <h3 className={transferResult.success ? 'success-text' : 'error-text'}>
                {transferResult.success ? '¡Transferencia Exitosa!' : 'Transferencia Fallida'}
              </h3>
              
              {transferResult.success ? (
                <>
                  <p className="result-message">
                    Tu transferencia ha sido procesada correctamente
                  </p>

                  <div className="receipt">
                    <h4>Comprobante de Transferencia</h4>
                    <div className="receipt-item">
                      <span>ID Transacción:</span>
                      <span className="receipt-value">{transferResult.transactionId}</span>
                    </div>
                    <div className="receipt-item">
                      <span>Fecha y Hora:</span>
                      <span className="receipt-value">{transferResult.date}</span>
                    </div>
                    <div className="receipt-item">
                      <span>Desde:</span>
                      <span className="receipt-value">{getAccountName(formData.sourceAccount)}</span>
                    </div>
                    <div className="receipt-item">
                      <span>Hacia:</span>
                      <span className="receipt-value">
                        {transferType === 'own' 
                          ? getAccountName(formData.destinationAccount)
                          : `${formData.destinationAccount} - ${destinationAccountInfo?.name}`
                        }
                      </span>
                    </div>
                    <div className="receipt-item highlight">
                      <span>Monto:</span>
                      <span className="receipt-value">
                        {formData.currency} {parseFloat(formData.amount).toFixed(2)}
                      </span>
                    </div>
                    {formData.description && (
                      <div className="receipt-item">
                        <span>Descripción:</span>
                        <span className="receipt-value">{formData.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="result-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handleDownloadReceipt}
                    >
                      Descargar Comprobante
                    </button>
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleNewTransfer}
                    >
                      Nueva Transferencia
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="result-message">
                    No se pudo procesar tu transferencia. Por favor, intenta nuevamente.
                  </p>
                  <div className="result-actions">
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={() => setStep('form')}
                    >
                      Reintentar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfers;