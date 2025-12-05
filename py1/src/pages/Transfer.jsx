// src/pages/Transfers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Transfers.css";
import { apiGet, apiPost } from "../services/apiClient";
import { getCurrentUser } from "../services/authService";

const Transfers = () => {
  const navigate = useNavigate();

  // ========== NUEVO: Cuentas desde API ==========
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  const [step, setStep] = useState("select"); // 'select', 'form', 'confirm', 'result'
  const [transferType, setTransferType] = useState(null); // 'own', 'third-party'
  const [formData, setFormData] = useState({
    sourceAccount: "", 
    destinationAccount: "", 
    currency: "",
    amount: "",
    description: "",
  });
  const [destinationAccountInfo, setDestinationAccountInfo] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false); // lo dejamos por si expandes terceros
  const [processingTransfer, setProcessingTransfer] = useState(false);

  // ========== Cargar cuentas del usuario autenticado ==========
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }

    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        setGlobalError(null);

        const res = await apiGet("/accounts");

        let accItems = [];
        if (Array.isArray(res)) accItems = res;
        else if (Array.isArray(res?.data)) accItems = res.data;
        else if (Array.isArray(res?.items)) accItems = res.items;
        else if (Array.isArray(res?.accounts)) accItems = res.accounts;

        const mappedAccounts = accItems.map((acc) => ({
          id: acc.id,
          name: acc.alias || acc.tipo_cuenta_nombre || "Cuenta Astralis",
          number: acc.iban,
          iban: acc.iban,
          currency: acc.moneda_iso || acc.moneda_nombre || "CRC",
          balance: Number(acc.saldo ?? 0),
        }));

        setAccounts(mappedAccounts);
      } catch (err) {
        console.error("Error cargando cuentas:", err);
        setGlobalError("No se pudieron cargar tus cuentas.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [navigate]);

  const handleTransferTypeSelect = (type) => {
    setTransferType(type);
    setStep("form");
    setFormData({
      sourceAccount: "",
      destinationAccount: "",
      currency: "",
      amount: "",
      description: "",
    });
    setErrors({});
    setDestinationAccountInfo(null);
    setTransferResult(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "sourceAccount") {
      const account = accounts.find((acc) => acc.id === value);
      if (account) {
        setFormData((prev) => ({ ...prev, currency: account.currency }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sourceAccount) {
      newErrors.sourceAccount = "Selecciona una cuenta de origen";
    }

    if (!formData.destinationAccount) {
      newErrors.destinationAccount =
        "Selecciona o ingresa una cuenta de destino";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Ingresa un monto válido";
    }

    if (!formData.currency) {
      newErrors.currency = "Selecciona una moneda";
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = "La descripción no puede exceder 255 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    if (transferType === "third-party") {
      setIsValidating(true);
      try {
        setDestinationAccountInfo({
          name: "Cuenta Astralis",
        });
      } finally {
        setIsValidating(false);
      }
    }

    setStep("confirm");
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? `${account.name} - ${account.number}` : "";
  };

  const getAvailableDestinationAccounts = () => {
    return accounts.filter((acc) => acc.id !== formData.sourceAccount);
  };

  const isFormValid = () => {
    return (
      formData.sourceAccount &&
      formData.destinationAccount &&
      formData.amount &&
      parseFloat(formData.amount) > 0 &&
      formData.currency
    );
  };

  // ========== CONFIRMAR TRANSFERENCIA (llama a /transfers/internal) ==========
  const handleConfirmTransfer = async () => {
    setProcessingTransfer(true);
    setGlobalError(null);

    try {
      const fromAcc = accounts.find(
        (acc) => acc.id === formData.sourceAccount
      );
      if (!fromAcc) {
        setGlobalError("No se pudo encontrar la cuenta de origen.");
        setProcessingTransfer(false);
        return;
      }

      let toIban = "";

      if (transferType === "own") {
        const toAcc = accounts.find(
          (acc) => acc.id === formData.destinationAccount
        );
        if (!toAcc) {
          setGlobalError("No se pudo encontrar la cuenta de destino.");
          setProcessingTransfer(false);
          return;
        }
        toIban = toAcc.iban;
      } else {
        // Terceros: el usuario digitó el IBAN directamente
        toIban = formData.destinationAccount;
      }

      const payload = {
        from_iban: fromAcc.iban,
        to_iban: toIban,
        amount: parseFloat(formData.amount),
        currency: formData.currency, // "CRC" / "USD"
        description: formData.description || null,
      };

      const res = await apiPost("/transfers/internal", payload);
      const data = res?.data || res;

      setTransferResult({
        success: true,
        transactionId:
          data?.receipt_number || data?.transfer_id || `TXN${Date.now()}`,
        date: new Date().toLocaleString("es-CR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });

      setStep("result");
    } catch (err) {
      console.error("Error realizando transferencia interna:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo procesar tu transferencia.";
      setGlobalError(msg);
      setTransferResult({ success: false });
      setStep("result");
    } finally {
      setProcessingTransfer(false);
    }
  };

  const handleDownloadReceipt = () => {
    alert("Función de descarga disponible próximamente");
  };

  const handleNewTransfer = () => {
    setStep("select");
    setTransferType(null);
    setFormData({
      sourceAccount: "",
      destinationAccount: "",
      currency: "",
      amount: "",
      description: "",
    });
    setDestinationAccountInfo(null);
    setTransferResult(null);
    setErrors({});
    setGlobalError(null);
  };

  return (
    <div className="transfers-page">
      <div className="transfers-container">
        <div className="transfers-header">
          <button
            className="transfers-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            ← Volver
          </button>
          <h1>Transferencias</h1>
        </div>

        {globalError && (
          <p className="state-text state-error" style={{ marginBottom: 12 }}>
            {globalError}
          </p>
        )}

        <div className="transfers-content">
          {/* Paso 1: Selección de tipo */}
          {step === "select" && (
            <div className="transfers-type-selection">
              <p className="transfers-instruction">
                Selecciona el tipo de transferencia:
              </p>

              {loadingAccounts && (
                <p className="state-text">Cargando tus cuentas...</p>
              )}

              {!loadingAccounts && accounts.length === 0 && (
                <p className="state-text">
                  No tenés cuentas registradas para realizar transferencias.
                </p>
              )}

              {!loadingAccounts && accounts.length > 0 && (
                <div className="transfers-type-cards">
                  <button
                    className="transfer-type-card"
                    onClick={() => handleTransferTypeSelect("own")}
                  >
                    <h3>Cuentas Propias</h3>
                    <p>Transfiere entre tus propias cuentas</p>
                  </button>

                  <button
                    className="transfer-type-card"
                    onClick={() => handleTransferTypeSelect("third-party")}
                  >
                    <h3>Terceros</h3>
                    <p>Transfiere a otras personas del mismo banco</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Formulario */}
          {step === "form" && (
            <div className="transfers-form">
              <div className="transfer-type-badge">
                {transferType === "own" ? "Cuentas Propias" : "Terceros"}
              </div>

              <div className="form-group">
                <label htmlFor="sourceAccount">Cuenta Origen *</label>
                <select
                  id="sourceAccount"
                  name="sourceAccount"
                  value={formData.sourceAccount}
                  onChange={handleInputChange}
                  className={errors.sourceAccount ? "error" : ""}
                  disabled={loadingAccounts || accounts.length === 0}
                >
                  <option value="" disabled hidden>
                    {loadingAccounts
                      ? "Cargando cuentas..."
                      : "Selecciona una cuenta"}
                  </option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.number} ({account.currency}{" "}
                      {account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
                {errors.sourceAccount && (
                  <span className="error-message">
                    {errors.sourceAccount}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="destinationAccount">Cuenta Destino *</label>
                {transferType === "own" ? (
                  <select
                    id="destinationAccount"
                    name="destinationAccount"
                    value={formData.destinationAccount}
                    onChange={handleInputChange}
                    className={errors.destinationAccount ? "error" : ""}
                    disabled={!formData.sourceAccount}
                  >
                    <option value="" disabled hidden>
                      Selecciona una cuenta
                    </option>
                    {getAvailableDestinationAccounts().map((account) => (
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
                    placeholder="Ingresa el IBAN de la cuenta destino"
                    className={errors.destinationAccount ? "error" : ""}
                    maxLength="34"
                  />
                )}
                {errors.destinationAccount && (
                  <span className="error-message">
                    {errors.destinationAccount}
                  </span>
                )}
                {isValidating && (
                  <span className="info-message">Validando cuenta...</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="currency">Moneda *</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={errors.currency ? "error" : ""}
                >
                  <option value="" disabled hidden>
                    Selecciona moneda
                  </option>
                  <option value="CRC">CRC - Colones</option>
                  <option value="USD">USD - Dólares</option>
                </select>
                {errors.currency && (
                  <span className="error-message">{errors.currency}</span>
                )}
              </div>

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
                  className={errors.amount ? "error" : ""}
                />
                {errors.amount && (
                  <span className="error-message">{errors.amount}</span>
                )}
              </div>

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
                  className={errors.description ? "error" : ""}
                />
                <span className="char-count">
                  {formData.description.length}/255
                </span>
                {errors.description && (
                  <span className="error-message">
                    {errors.description}
                  </span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep("select")}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleContinue}
                  disabled={!isFormValid() || isValidating || loadingAccounts}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {step === "confirm" && (
            <div className="transfers-confirm">
              <h3>Confirmar Transferencia</h3>
              <p className="confirm-subtitle">
                Verifica los datos antes de confirmar
              </p>

              <div className="confirm-details">
                <div className="confirm-item">
                  <span className="confirm-label">Tipo:</span>
                  <span className="confirm-value">
                    {transferType === "own"
                      ? "Cuentas Propias"
                      : "Terceros (mismo banco)"}
                  </span>
                </div>

                <div className="confirm-item">
                  <span className="confirm-label">Desde:</span>
                  <span className="confirm-value">
                    {getAccountName(formData.sourceAccount)}
                  </span>
                </div>

                <div className="confirm-item">
                  <span className="confirm-label">Hacia:</span>
                  <span className="confirm-value">
                    {transferType === "own"
                      ? getAccountName(formData.destinationAccount)
                      : `${formData.destinationAccount}${
                          destinationAccountInfo?.name
                            ? ` - ${destinationAccountInfo.name}`
                            : ""
                        }`}
                  </span>
                </div>

                <div className="confirm-item">
                  <span className="confirm-label">Monto:</span>
                  <span className="confirm-value highlight">
                    {formData.currency}{" "}
                    {parseFloat(formData.amount).toFixed(2)}
                  </span>
                </div>

                {formData.description && (
                  <div className="confirm-item">
                    <span className="confirm-label">Descripción:</span>
                    <span className="confirm-value">
                      {formData.description}
                    </span>
                  </div>
                )}

                <div className="confirm-item">
                  <span className="confirm-label">Fecha:</span>
                  <span className="confirm-value">
                    {new Date().toLocaleString("es-CR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {globalError && (
                <p className="state-text state-error" style={{ marginTop: 8 }}>
                  {globalError}
                </p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep("form")}
                >
                  Modificar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmTransfer}
                  disabled={processingTransfer}
                >
                  {processingTransfer
                    ? "Procesando..."
                    : "Confirmar Transferencia"}
                </button>
              </div>
            </div>
          )}

          {/* Paso 4: Resultado */}
          {step === "result" && transferResult && (
            <div className="transfers-result">
              <div
                className={`result-icon ${
                  transferResult.success ? "success" : "error"
                }`}
              >
                {transferResult.success ? "✓" : "✕"}
              </div>

              <h3
                className={
                  transferResult.success ? "success-text" : "error-text"
                }
              >
                {transferResult.success
                  ? "¡Transferencia Exitosa!"
                  : "Transferencia Fallida"}
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
                      <span className="receipt-value">
                        {transferResult.transactionId}
                      </span>
                    </div>
                    <div className="receipt-item">
                      <span>Fecha y Hora:</span>
                      <span className="receipt-value">
                        {transferResult.date}
                      </span>
                    </div>
                    <div className="receipt-item">
                      <span>Desde:</span>
                      <span className="receipt-value">
                        {getAccountName(formData.sourceAccount)}
                      </span>
                    </div>
                    <div className="receipt-item">
                      <span>Hacia:</span>
                      <span className="receipt-value">
                        {transferType === "own"
                          ? getAccountName(formData.destinationAccount)
                          : `${formData.destinationAccount}${
                              destinationAccountInfo?.name
                                ? ` - ${destinationAccountInfo.name}`
                                : ""
                            }`}
                      </span>
                    </div>
                    <div className="receipt-item highlight">
                      <span>Monto:</span>
                      <span className="receipt-value">
                        {formData.currency}{" "}
                        {parseFloat(formData.amount).toFixed(2)}
                      </span>
                    </div>
                    {formData.description && (
                      <div className="receipt-item">
                        <span>Descripción:</span>
                        <span className="receipt-value">
                          {formData.description}
                        </span>
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
                    {globalError ||
                      "No se pudo procesar tu transferencia. Por favor, intenta nuevamente."}
                  </p>
                  <div className="result-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setStep("form")}
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
