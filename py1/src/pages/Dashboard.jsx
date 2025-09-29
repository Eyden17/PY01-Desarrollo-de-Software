import React, { useState, useEffect } from 'react';
import '../assets/css/Dashboard.css';
import CreditCard from '../assets/components/CreditCard';

const formatCurrency = (amount, currency) => {
  const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  
  if (currency === "CRC") {
    return `₡${formattedAmount}`;
  } else {
    return `$${formattedAmount}`;
  }
};

const mockUserData = {
  name: "Juan Pérez",
  accounts: [
    {
      account_id: "CR01-0001-0002-123456789012",
      alias: "Ahorros Principal",
      type: "Ahorro",
      currency: "CRC",
      balance: 1523400.50,
    },
    {
      account_id: "CR01-0001-0003-987654321098",
      alias: "Cuenta Corriente",
      type: "Corriente",
      currency: "USD",
      balance: 5230.00,
    },
  ],
  creditCards: [
    {
      id: "card-1",
      type: "Gold",
      number: "4532 1488 5398 7654",
      exp: "08/28",
      holder: "JUAN PEREZ",
      vendor: "MC"
    },
    {
      id: "card-2",
      type: "Platinum", 
      number: "5523 4491 2034 9876",
      exp: "12/29",
      holder: "JUAN PEREZ",
      vendor: "MC"
    },
    {
      id: "card-3",
      type: "Black",
      number: "3782 822463 10005",
      exp: "05/30",
      holder: "JUAN PEREZ", 
      vendor: "MC"
    }
  ],
};

const Dashboard = () => {
  const { name, accounts, creditCards } = mockUserData;
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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
          <h1>Dashboard</h1>
        </header>

        {/* Sección de Cuentas */}
        <section className="dashboard-section accounts" aria-labelledby="cuentas-heading">
          <h2 id="cuentas-heading" className="section-title">Cuentas</h2>
          <ul className="accounts-list">
            {accounts.map((account) => (
              <li key={account.account_id} className="accounts-item">
                <article className="account-card">
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

        {/* Sección de Tarjetas */}
        <section className="dashboard-section cards" aria-labelledby="cards-heading">
          <h2 id="cards-heading" className="section-title">Mis Tarjetas</h2>

          <div className="cards-carousel-container">
            {/* Flecha izquierda */}
            <button
              type="button"
              className="carousel-arrow carousel-arrow--left"
              onClick={handlePrevCard}
              aria-label="Tarjeta anterior"
              disabled={currentCardIndex === 0}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="cards-carousel-wrapper">
              <ul className="cards-carousel">
                {creditCards.map((card) => (
                  <li key={card.id} className="card-item">
                    <CreditCard
                      type={card.type}
                      number={card.number}
                      exp={card.exp}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Indicadores de posición */}
          <div className="carousel-indicators">
            {creditCards.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${currentCardIndex === index ? 'active' : ''}`}
                onClick={() => handleIndicatorClick(index)}
                aria-label={`Ir a tarjeta ${index + 1}`}
              />
            ))}
          </div>
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
          >
            Nueva transferencia
          </button>
        </section>
      </main>
  );
};

export default Dashboard;