import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transfers from './pages/Transfer.jsx';
import userData from './data/userData.json'; // Importar datos del usuario

function App() {
  // Transforma las cuentas al formato que espera el componente Transfers
  const userAccountsForTransfer = userData.accounts.map(account => ({
    id: account.account_id,
    name: account.alias,
    number: account.account_id,
    currency: account.currency,
    balance: account.balance,
    type: account.type
  }));

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfers" element={<Transfers userAccounts={userAccountsForTransfer} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;