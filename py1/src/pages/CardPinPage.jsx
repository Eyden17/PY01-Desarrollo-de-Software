// src/pages/CardPinPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "../assets/css/CardPage.css";
import { apiGet, apiPost } from "../services/apiClient";
import { getCurrentUser } from "../services/authService";

export default function CardPinPage() {
  const { id: cardId } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [progress, setProgress] = useState(100);

  const [pinStep, setPinStep] = useState(1); 
  const [otpInput, setOtpInput] = useState("");
  const [otpStatus, setOtpStatus] = useState("idle"); 

  const [details, setDetails] = useState(null); 
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // ========= Proteger ruta y cargar info básica de la tarjeta =========
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }

    if (!cardId) {
      navigate("/dashboard");
      return;
    }

    const loadCard = async () => {
      try {
        const res = await apiGet(`/cards/${cardId}`);
        const data = res?.data || res;

        if (!data) {
          setErrorMsg("No se pudo cargar la tarjeta.");
          return;
        }

        const mappedCard = {
          id: data.id,
          number: data.numero_enmascarado,
          exp: data.fecha_expiracion,
          holder: data.titular || "Cliente Astralis",
          type: data.tipo_tarjeta?.nombre || "Tarjeta Astralis",
        };

        setCard(mappedCard);
      } catch (err) {
        console.error("Error cargando tarjeta:", err);
        setErrorMsg("Error al cargar los datos de la tarjeta.");
      }
    };

    loadCard();
  }, [cardId, navigate]);

  // ========= Generar OTP (llama a POST /cards/:cardId/otp) =========
  const handleRequestOtp = async () => {
    setErrorMsg(null);
    setOtpStatus("loading");

    try {
      const res = await apiPost(`/cards/${cardId}/otp`, {
        expires_in_seconds: 300,
      });

      const data = res?.data || res;
      setOtpStatus("otp_sent");

      if (data?.otp) {
        alert(`Código OTP de prueba: ${data.otp}`);
      }
    } catch (err) {
      console.error("Error generando OTP:", err);
      setOtpStatus("error");
      setErrorMsg("No se pudo generar el código OTP. Intenta de nuevo.");
    }
  };

  // ========= Verificar OTP (POST /cards/:cardId/view-details) =========
  const handleVerifyOtp = async () => {
    setErrorMsg(null);

    if (!otpInput.trim()) {
      setErrorMsg("Por favor, ingresa el código OTP.");
      return;
    }

    setOtpStatus("loading");

    try {
      const res = await apiPost(`/cards/${cardId}/view-details`, {
        codigo: otpInput.trim(),
      });

      const data = res?.data || res;
      setOtpStatus("success");
      setPinStep(2);

      setDetails({
        numero_enmascarado: data.numero_enmascarado,
        cvv: data.cvv,
        pin: data.pin,
        fecha_expiracion: data.fecha_expiracion,
        tipo_tarjeta: data.tipo_tarjeta,
        moneda: data.moneda,
      });
    } catch (err) {
      console.error("Error validando OTP:", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Código OTP inválido o expirado.";
      setOtpStatus("error");
      setErrorMsg(msg);
    }
  };

  // ========= Copiar PIN al portapapeles =========
  const handleCopyPin = () => {
    if (!details?.pin) return;

    navigator.clipboard
      .writeText(String(details.pin))
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Error copiando PIN:", err);
      });
  };

  // TIMER para cerrar después de 10 segundos + barra de progreso
  useEffect(() => {
    if (pinStep === 2) {
      const total = 10000; // 10s
      const interval = 100; // cada 0.1s
      let elapsed = 0;

      const intervalId = setInterval(() => {
        elapsed += interval;
        const newProgress = Math.max(0, 100 - (elapsed / total) * 100);
        setProgress(newProgress);
      }, interval);

      const timer = setTimeout(() => {
        navigate(`/card/${cardId}`);
      }, total);

      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
      };
    }
  }, [pinStep, navigate, cardId]);

  return (
    <main className="pin-page">
      <header className="pin-header">
        <button className="back-btn" onClick={() => navigate(`/card/${cardId}`)}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <h1 className="pin-title">Consultar PIN</h1>
        <p className="pin-subtitle">
          {pinStep === 1
            ? "Por seguridad, necesitás un código OTP para ver tu PIN y CVV."
            : "Estos datos son confidenciales. No los compartás con terceros."}
        </p>
      </header>

      <section className="pin-content">
        <div className="pin-card">
          {pinStep === 1 ? (
            <div className="pin-step">
              {/* Datos básicos de la tarjeta arriba, si ya cargó */}
              {card && (
                <div className="pin-info-box mb-2">
                  <div className="detail-row">
                    <span className="label">Tarjeta</span>
                    <span className="value">
                      **** **** ****{" "}
                      {String(card.number || "").slice(-4)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Titular</span>
                    <span className="value">{card.holder}</span>
                  </div>
                </div>
              )}

              <button
                className="btn-outline btn-full mb-2"
                type="button"
                onClick={handleRequestOtp}
                disabled={otpStatus === "loading"}
              >
                {otpStatus === "loading"
                  ? "Generando código..."
                  : "Enviar código OTP"}
              </button>

              {otpStatus === "otp_sent" && (
                <p className="state-text">
                  Se generó un código OTP. Revisa tu canal de notificación.
                </p>
              )}

              <label className="label" htmlFor="otp-input">
                Código OTP
              </label>
              <input
                id="otp-input"
                type="text"
                className="input otp-input"
                placeholder="Ingresa el código recibido"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />

              <button
                className="btn-primary btn-full"
                onClick={handleVerifyOtp}
                disabled={otpStatus === "loading"}
              >
                {otpStatus === "loading" ? "Verificando..." : "Verificar código"}
              </button>

              {errorMsg && (
                <p className="state-text state-error" style={{ marginTop: 8 }}>
                  {errorMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="pin-step">
              <div className="pin-info-box">
                <div className="detail-row">
                  <span className="label">Tarjeta</span>
                  <span className="value">
                    **** **** ****{" "}
                    {String(details?.numero_enmascarado || "").slice(-4)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">CVV</span>
                  <span className="value mono">{details?.cvv}</span>
                </div>
                <div className="detail-row">
                  <span className="label">PIN</span>
                  <span className="value mono highlight">{details?.pin}</span>
                </div>
              </div>

              <div className="pin-progress-wrapper">
                <div
                  className="pin-progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <button className="btn-outline btn-full" onClick={handleCopyPin}>
                {copied ? "¡Copiado!" : "Copiar PIN"}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
