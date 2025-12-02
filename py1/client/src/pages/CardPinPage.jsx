// src/pages/CardPinPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import userData from "../data/userData.json";
import "../assets/css/CardPage.css";

export default function CardPinPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const card = userData.creditCards.find((c) => c.id === id);
  const [progress, setProgress] = useState(100);

  const [pinStep, setPinStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("idle");

  useEffect(() => {
    if (!card) navigate("/");
  }, [card, navigate]);

  const handleVerifyOtp = () => {
    setOtpStatus("loading");

    setTimeout(() => {
      if (otp === "123456") {
        setPinStep(2);
        setOtpStatus("success");
      } else {
        setOtpStatus("error");
      }
    }, 700);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(String(card.pin));
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
        navigate(`/card/${id}`);
      }, total);

      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
      };
    }
  }, [pinStep, navigate, id]);


  return (
    <main className="pin-page">
      <header className="pin-header">
        <button className="back-btn" onClick={() => navigate(`/card/${card.id}`)}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <h1 className="pin-title">Consultar PIN</h1>
        <p className="pin-subtitle">
          {pinStep === 1
            ? "Ingresa el código de verificación para ver los datos de seguridad."
            : "Estos datos son confidenciales. No los compartas con terceros."}
        </p>
      </header>

      <section className="pin-content">
        <div className="pin-card">
          {pinStep === 1 ? (
            <div className="pin-step">
              <label className="label" htmlFor="otp">
                Código OTP (usa 123456)
              </label>
              <input
                id="otp"
                type="text"
                className="input otp-input"
                placeholder="Ingresa el código"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                className="btn-primary btn-full"
                onClick={handleVerifyOtp}
                disabled={otpStatus === "loading"}
              >
                {otpStatus === "loading" ? "Verificando..." : "Verificar"}
              </button>

              {otpStatus === "error" && (
                <p className="state-text state-error">
                  Código inválido. Intenta con 123456.
                </p>
              )}
            </div>
          ) : (
            <div className="pin-step">
              <div className="pin-info-box">
                <div className="detail-row">
                  <span className="label">Tarjeta</span>
                  <span className="value">
                    **** **** **** {String(card.number).slice(-4)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">CVV</span>
                  <span className="value mono">{card.cvv}</span>
                </div>
                <div className="detail-row">
                  <span className="label">PIN</span>
                  <span className="value mono highlight">{card.pin}</span>
                </div>
              </div>

              <div className="pin-progress-wrapper">
      <div
        className="pin-progress-bar"
        style={{ width: `${progress}%` }}
      ></div>
    </div>

              <button className="btn-outline btn-full" onClick={handleCopyPin}>
                Copiar PIN
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
