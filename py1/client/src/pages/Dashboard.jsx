import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import '../assets/css/Dashboard.css';
import CreditCard from '../assets/components/CreditCard';
import AccountModal from "../assets/components/AccountModal";
import CardDetailModal from "../assets/components/CardDetailModal";
import userData from '../data/userData.json';
import logo from "../assets/img/logo-white.svg";

const formatCurrency = (amount, currency) => {
  const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  
  if (currency === "CRC") {
    return `₡${formattedAmount}`;
  } else {
    return `$${formattedAmount}`;
  }
};

const Dashboard = () => {
  const navigate = useNavigate(); // Inicializar navigate
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const { name, accounts, creditCards } = userData;

  const handleNextCard = () => {
    const carousel = document.querySelector('.cards-carousel');
    const cardWidth = 300 + 32;
    if (carousel) {
      carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setCurrentCardIndex(prev => Math.min(prev + 1, creditCards.length - 1));
    }
  };

  const handlePrevCard = () => {
    const carousel = document.querySelector('.cards-carousel');
    const cardWidth = 300 + 32;
    if (carousel) {
      carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setCurrentCardIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const handleIndicatorClick = (index) => {
    const carousel = document.querySelector('.cards-carousel');
    const cardWidth = 300 + 32;
    if (carousel) {
      carousel.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setCurrentCardIndex(index);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  useEffect(() => {
    const carousel = document.querySelector('.cards-carousel');
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = 300 + 32;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentCardIndex(newIndex);
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="dashboard">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="header-center">
          <h1>Dashboard</h1>
        </div>
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo" />
        </div>
      </header>

      {/* Sección de Cuentas */}
      <section className="dashboard-section accounts" aria-labelledby="cuentas-heading">
        <h2 id="cuentas-heading" className="section-title">Cuentas</h2>
        <ul className="accounts-list">
          {accounts.map((account) => (
            <li key={account.account_id} className="accounts-item">
              <article
                className="account-card"
                onClick={() => setSelectedAccount(account)}
              >
                <p className="account-balance">
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <div className="account-field">
                  <span className="account-label">Alias</span>
                  <span className="account-value">{account.alias}</span>
                </div>
                <div className="account-field">
                  <span className="account-label">Número</span>
                  <span className="account-value">{account.account_id}</span>
                </div>
                <div className="account-field">
                  <span className="account-label">Titular</span>
                  <span className="account-value">{name}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {selectedAccount && (
        <AccountModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      {/* Sección de Tarjetas */}
      <section className="dashboard-section cards" aria-labelledby="cards-heading">
        <h2 id="cards-heading" className="section-title">
          Mis Tarjetas
        </h2>

        <div className="cards-carousel-container">
          {/* Flecha izquierda */}
          <button
            type="button"
            className="carousel-arrow carousel-arrow--left"
            onClick={handlePrevCard}
            aria-label="Tarjeta anterior"
            disabled={currentCardIndex === 0}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="cards-carousel-wrapper">
            <ul className="cards-carousel">
              {creditCards.map((card) => (
                <li
                  key={card.id}
                  className="card-item"
                  onClick={() => handleCardClick(card)}
                >
                  <CreditCard
                    type={card.type}
                    number={card.number}
                    exp={card.exp}
                    pin={card.pin}
                    holder={card.holder}
                    vendor={card.vendor}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Flecha derecha */}
          <button
            type="button"
            className="carousel-arrow carousel-arrow--right"
            onClick={handleNextCard}
            aria-label="Siguiente tarjeta"
            disabled={currentCardIndex === creditCards.length - 1}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Indicadores de posición */}
        <div className="carousel-indicators">
          {creditCards.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${
                currentCardIndex === index ? "active" : ""
              }`}
              onClick={() => handleIndicatorClick(index)}
              aria-label={`Ir a tarjeta ${index + 1}`}
            />
          ))}
        </div>

        {/* Modal */}
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </section>

      {/* Sección de Transferencias */}
      <section
        className="dashboard-section transfers"
        aria-labelledby="transfers-heading"
      >
        <h2 id="transfers-heading" className="section-title">
          Transferencias
        </h2>
        <p className="transfers-description">
          Realiza transferencias entre tus cuentas o a terceros registrados en el banco.
        </p>
        <button
          type="button"
          className="transfers-new-btn"
          onClick={() => navigate('/transfers')} // Navegar a la página
        >
          Nueva transferencia
        </button>
      </section>
    </main>
  );
};

export default Dashboard;