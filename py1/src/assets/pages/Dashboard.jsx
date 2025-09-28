import React from 'react';
import '../css/Dashboard.css';
import CreditCard from '../components/CreditCard';

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
      vendor: "VISA"
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
      vendor: "AMEX"
    }
  ],
};

const Dashboard = () => {
  const { name, accounts, creditCards } = mockUserData;

  return (
      <main className="dashboard">

        {/* Encabezado */}
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p className>Bienvenido, {name}</p>
        </header>

        {/* Sección de Cuentas */}
        <section className="dashboard-section accounts" aria-labelledby="cuentas-heading">
          <h2 id="cuentas-heading">Cuentas</h2>
          <ul className="accounts-list">
            {accounts.map((account) => (
              <li key={account.account_id} className="accounts-item">
                <article className="account-card">
                  <h3 className="account-card-alias">{account.alias}</h3>
                  <p className="account-card-number">
                    <strong>Número:</strong> {account.account_id}
                  </p>
                  <p className="account-card-currency">
                    <strong>Moneda:</strong> {account.currency}
                  </p>
                  <p className="account-card-balance">
                    <strong>Saldo:</strong>{" "}
                    {account.currency === "CRC"
                      ? `₡${account.balance.toFixed(2)}`
                      : `$${account.balance.toFixed(2)}`}
                  </p>
                  <button
                    type="button"
                    className="account-card-details-btn"
                  >
                    Ver detalles
                  </button>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* Sección de Tarjetas */}
        <section className="dashboard-section cards" aria-labelledby="cards-heading">
          <h2 id="cards-heading" className="section-title">
            Mis Tarjetas
          </h2>

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