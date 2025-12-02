import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react";

import userData from "../data/userData.json";
import movementsData from "../data/movements.json";

import "../assets/css/AccountPage.css";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const formatCurrency = (amount, currency) => {
  const formattedAmount = Math.abs(amount)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  return currency === "CRC" ? `₡${formattedAmount}` : `$${formattedAmount}`;
};

export default function AccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();

const account = userData.accounts.find((acc) => acc.account_id === id);

  const [movements, setMovements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!account) {
      navigate("/");
      return;
    }

    setStatus("loading");

    setTimeout(() => {
      try {
        const movs = movementsData.filter(
          (m) => m.account_id === account.account_id
        );
        setMovements(movs);
        setFiltered(movs);
        setStatus(movs.length ? "ready" : "empty");
      } catch (err) {
        setStatus("error");
      }
    }, 400);
  }, [account, navigate]);

  useEffect(() => {
    let result = [...movements];

    if (filterType !== "ALL") {
      result = result.filter((m) => m.type === filterType);
    }

    if (search.trim()) {
      result = result.filter((m) =>
        m.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [filterType, search, movements]);

  if (!account) return null;

  return (
    <main className="account-page">
      {/* HEADER */}
      <header className="acc-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <h1 className="header-title">{account.alias}</h1>
        <p className="header-sub">
          {account.type} • {account.currency}
        </p>
      </header>

      {/* CONTENIDO */}
      <section className="account-content">
        {/* BALANCE */}
        <div className="balance-card">
          <p className="label">Saldo disponible</p>
          <h2 className="balance">
            {formatCurrency(account.balance, account.currency)}
          </h2>

          <div className="info-row">
            <div>
              <p className="label">Número de cuenta</p>
              <p className="value">{account.account_id}</p>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filter-card">
          <h3 className="filter-title">Movimientos</h3>

          <div className="filters">
            {/* SELECT NATIVO */}
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="CREDITO">Créditos</option>
              <option value="DEBITO">Débitos</option>
            </select>

            <div className="input-wrapper">
              <Search className="input-icon" />
              <input
                className="input"
                placeholder="Buscar descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* LISTA DE MOVIMIENTOS */}
          <div className="movements">
            {status === "loading" && (
              <p className="state-text">Cargando movimientos...</p>
            )}
            {status === "error" && (
              <p className="state-text error">Error al cargar movimientos</p>
            )}
            {status === "empty" && (
              <p className="state-text">No hay movimientos registrados</p>
            )}

            {status === "ready" &&
              filtered.map((m) => (
                <div
                  key={m.id}
                  className={`movement-card ${
                    m.type === "CREDITO" ? "border-success" : "border-warning"
                  }`}
                  onClick={() =>
                    setExpandedId(expandedId === m.id ? null : m.id)
                  }
                >
                  <div className="movement-main">
                    <div className="movement-info">
                      {m.type === "CREDITO" ? (
                        <TrendingUp className="mov-icon success" />
                      ) : (
                        <TrendingDown className="mov-icon warning" />
                      )}
                      <div>
                        <p className="mov-desc">{m.description}</p>
                        <p className="mov-date">{formatDate(m.date)}</p>
                      </div>
                    </div>

                    <p
                      className={`mov-amount ${
                        m.type === "CREDITO" ? "success" : "warning"
                      }`}
                    >
                      {m.type === "CREDITO" ? "+" : "-"}
                      {formatCurrency(m.balance, m.currency)}
                    </p>
                  </div>

                  {expandedId === m.id && (
                    <div className="movement-details">
                      <div className="detail-row">
                        <span className="label">ID:</span>
                        <span className="value">{m.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Tipo:</span>
                        <span className="value">{m.type}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Cuenta:</span>
                        <span className="value">{m.account_id}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
