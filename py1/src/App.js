import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Home from './assets/pages/Home.jsx';
import Dashboard from './assets/pages/Dashboard.jsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
