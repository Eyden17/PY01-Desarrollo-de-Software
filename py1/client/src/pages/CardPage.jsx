// src/pages/CardPage.jsx (ajusta la ruta según tu estructura)

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ShoppingBag, Wallet, Eye } from "lucide-react";

import CreditCard from "../assets/components/CreditCard.jsx";
import userData from "../data/userData.json";
import transactionsData from "../data/transactions.json";

import "../assets/css/CardPage.css";

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

export default function CardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const card = userData.creditCards.find((c) => c.id === id);

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!card) {
      navigate("/");
      return;
    }

    setStatus("loading");

    setTimeout(() => {
      try {
        const cardTxs = transactionsData.filter((t) => t.card_id === card.id);
        setTransactions(cardTxs);
        setFiltered(cardTxs);
        setStatus(cardTxs.length ? "ready" : "empty");
      } catch (err) {
        setStatus("error");
      }
    }, 500);
  }, [card, navigate]);

  useEffect(() => {
    let result = [...transactions];

    if (filterType !== "ALL") {
      result = result.filter((t) => t.tipo === filterType);
    }

    if (search.trim()) {
      result = result.filter((t) =>
        t.descripcion.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [filterType, search, transactions]);

  if (!card) return null;

  return (
    <main className="card-page">
      {/* HEADER */}
      <header className="card-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <h1 className="card-header-title">{card.type}</h1>
        <p className="card-header-sub">{card.holder}</p>
      </header>

      {/* CONTENIDO */}
      <section className="card-content">
        {/* TARJETA VISUAL */}
        <div className="card-display">
          <CreditCard
            type={card.type}
            number={card.number}
            exp={card.exp}
            holder={card.holder}
            vendor={card.vendor}
          />
        </div>

        {/* BOTÓN PIN */}
        <div className="card-pin-section">
          <button
            className="btn-outline btn-pin"
            onClick={() => navigate(`/card/${card.id}/pin`)}
          >
            <Eye className="btn-icon" />
            <span>Ver PIN</span>
          </button>
        </div>

        {/* TRANSACCIONES */}
        <div className="card-transactions-card">
          <h3 className="section-title">Transacciones</h3>

          {/* FILTROS */}
          <div className="filters">
            {/* Select nativo */}
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todas</option>
              <option value="COMPRA">Compras</option>
              <option value="PAGO">Pagos</option>
            </select>

            {/* Input con icono */}
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

          {/* LISTA */}
          <div className="movements">
            {status === "loading" && (
              <p className="state-text">Cargando transacciones...</p>
            )}
            {status === "error" && (
              <p className="state-text state-error">
                Error al cargar transacciones
              </p>
            )}
            {status === "empty" && (
              <p className="state-text">No hay transacciones registradas</p>
            )}
            {status === "ready" && filtered.length === 0 && (
              <p className="state-text">
                No hay transacciones que coincidan con el filtro
              </p>
            )}

            {status === "ready" &&
              filtered.map((t) => (
                <div
                  key={t.id}
                  className={`movement-card ${
                    t.tipo === "PAGO" ? "border-success" : "border-primary"
                  }`}
                  onClick={() =>
                    setExpandedId(expandedId === t.id ? null : t.id)
                  }
                >
                  <div className="movement-main">
                    <div className="movement-info">
                      {t.tipo === "COMPRA" ? (
                        <ShoppingBag className="mov-icon primary" />
                      ) : (
                        <Wallet className="mov-icon success" />
                      )}

                      <div>
                        <p className="mov-desc">{t.descripcion}</p>
                        <p className="mov-date">{formatDate(t.fecha)}</p>
                      </div>
                    </div>

                    <p
                      className={`mov-amount ${
                        t.tipo === "PAGO" ? "success" : "primary"
                      }`}
                    >
                      {t.tipo === "PAGO" ? "+" : "-"}
                      {formatCurrency(t.saldo, t.moneda)}
                    </p>
                  </div>

                  {expandedId === t.id && (
                    <div className="movement-details">
                      <div className="detail-row">
                        <span className="label">ID:</span>
                        <span className="value">{t.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Tipo:</span>
                        <span className="value">{t.tipo}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Moneda:</span>
                        <span className="value">{t.moneda}</span>
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
