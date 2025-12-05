import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreditCard from "../assets/components/CreditCard.jsx";
import userDataFallback from "../data/userData.json"; // por si falla la API
import { FaRightFromBracket } from "react-icons/fa6";
import { ArrowRight, Wallet, CreditCard as CreditCardIcon } from "lucide-react";

import { apiGet } from "../services/apiClient";
import { getCurrentUser, clearSession } from "../services/authService";

import "../assets/css/Dashboard.css";

const formatCurrency = (amount, currency) => {
  const num = Number(amount) || 0;
  const formattedAmount = num
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  return currency === "CRC" ? `₡${formattedAmount}` : `$${formattedAmount}`;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [name, setName] = useState(userDataFallback.name);
  const [accounts, setAccounts] = useState(userDataFallback.accounts || []);
  const [creditCards, setCreditCards] = useState(userDataFallback.creditCards || []);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [carouselOverflow, setCarouselOverflow] = useState(false);

  // 1) Proteger ruta y cargar datos desde API
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }

    setName(user.username || user.name || "Cliente Astralis");

    const loadData = async () => {
      try {
        const [accountsRes, cardsRes] = await Promise.all([
          apiGet("/accounts"), // GET /api/v1/accounts
          apiGet("/cards"),    // GET /api/v1/cards
        ]);

        const cardItems = cardsRes.items || cardsRes.cards || [];

        // ========= CUENTAS =========
        let accItems = [];

        if (Array.isArray(accountsRes)) {
          accItems = accountsRes;
        } else if (Array.isArray(accountsRes?.data)) {
          accItems = accountsRes.data;
        } else if (Array.isArray(accountsRes?.items)) {
          accItems = accountsRes.items;
        } else if (Array.isArray(accountsRes?.accounts)) {
          accItems = accountsRes.accounts;
        }

        const mappedAccounts = accItems.map((acc) => ({
          account_id: acc.id,
          iban: acc.iban,
          type: acc.tipo_cuenta_nombre || "Cuenta Astralis",
          alias: acc.alias || acc.iban || "Cuenta Astralis",
          balance: Number(acc.saldo ?? 0),
          currency: acc.moneda_iso || "CRC",
        }));

        console.log("Mapped Accounts:", mappedAccounts);

        // Mapear tarjetas
        const mappedCards = cardItems.map((card) => ({
          id: card.id,
          holder: card.titular || "Tarjeta Astralis",
          number: card.numero_enmascarado,
          exp: card.fecha_expiracion,
          balance: Number(card.saldo_actual ?? 0),
          currency: card.moneda.nombre || "CRC",
          type: card.tipo_tarjeta.nombre,
          vendor: "MC"
        }));

        console.log("Mapped Accounts:", mappedAccounts);


        setAccounts(mappedAccounts);
        setCreditCards(mappedCards);
      } catch (err) {
        console.error("Error cargando datos del dashboard:", err);
        // si falla, seguimos con userData.json
      }
    };

    loadData();
  }, [navigate]);

  // 2) Lógica del carrusel (igual que antes)
  useEffect(() => {
    const carousel = document.querySelector(".cards-carousel");
    if (!carousel) return;

    const checkOverflow = () => {
      setCarouselOverflow(carousel.scrollWidth > carousel.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  useEffect(() => {
    const carousel = document.querySelector(".cards-carousel");
    if (!carousel || !creditCards.length) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = carousel.scrollWidth / creditCards.length;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentCardIndex(newIndex);
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, [creditCards.length]);

  const scrollToCard = (index) => {
    const carousel = document.querySelector(".cards-carousel");
    if (carousel && creditCards.length) {
      const cardWidth = carousel.scrollWidth / creditCards.length;
      carousel.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    try {
      clearSession();

      navigate("/", { replace: true });

      window.location.href = "/";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };


  return (
    <main className="dashboard">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <p className="welcome">Bienvenido</p>
            <h1 className="username">{name}</h1>
          </div>
          <div className="header-actions">
            <button
              className="logout-btn"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <FaRightFromBracket className="logout-icon" />
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        
        {/* SECCIÓN DE TARJETAS */}
        <section>
          <div className="section-title-container">
            <CreditCardIcon className="section-icon" />
            <h2 className="section-title">Mis Tarjetas</h2>
          </div>

          <div className="cards-carousel-wrapper">
            {carouselOverflow && (
              <button
                className="carousel-arrow left"
                onClick={() => scrollToCard(Math.max(currentCardIndex - 1, 0))}
              >
                ❮
              </button>
            )}

            <div className="cards-carousel">
              {creditCards.map((card) => (
                <div
                  key={card.id}
                  className="carousel-card"
                  onClick={() => navigate(`/card/${card.id}`)}
                >
                  <CreditCard {...card} />
                </div>
              ))}
            </div>

            {carouselOverflow && (
              <>
                <button
                  className="carousel-arrow right"
                  onClick={() =>
                    scrollToCard(
                      Math.min(currentCardIndex + 1, creditCards.length - 1)
                    )
                  }
                >
                  ❯
                </button>

                <div className="carousel-indicators">
                  {creditCards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToCard(index)}
                      className={`carousel-indicator ${
                        currentCardIndex === index ? "active" : ""
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* SECCIÓN DE CUENTAS */}
        <section>
          <div className="section-title-container">
            <Wallet className="section-icon" />
            <h2 className="section-title">Mis Cuentas</h2>
          </div>

          <div className="accounts-grid">
            {accounts.map((account) => (
              <div
                key={account.account_id}
                className="account-card"
                onClick={() => navigate(`/account/${account.account_id}`)}
              >
                <div className="account-card-content">
                  <div className="account-header">
                    <div>
                      <p className="account-type">{account.type}</p>
                      <h3 className="account-alias">{account.alias}</h3>
                    </div>
                    <ArrowRight className="account-arrow" />
                  </div>

                  <div className="account-balance-container">
                    <p className="account-balance-label">Saldo disponible</p>
                    <p className="account-balance">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>

                  <div className="account-footer">
                    <span>
                      <strong>Cuenta:</strong>{" "}
                      {account.iban}
                    </span>
                    <span>
                      <strong>Moneda:</strong> {account.currency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN DE TRANSFERENCIAS */}
        <section>
          <div className="transfer-card">
            <div className="transfer-content">
              <h3 className="transfer-title">Transferencias</h3>
              <p className="transfer-text">
                Realiza transferencias entre tus cuentas o a terceros.
              </p>

              <button
                className="transfer-btn"
                onClick={() => navigate("/transfers")}
              >
                Nueva transferencia
                <ArrowRight className="transfer-btn-icon" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
