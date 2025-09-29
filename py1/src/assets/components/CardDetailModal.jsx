import { useEffect, useState } from "react";
import "../css/modal.css";
import transactionsData from "../../data/transactions.json";

export default function CardDetailModal({ card, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
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
    }, 800);
  }, [card.id]);

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header tarjeta */}
        <header className="modal-header">
          <h2>
            {card.type} - {card.holder}
          </h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </header>

        {/* Filtros */}
        <div className="filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="COMPRA">Compras</option>
            <option value="PAGO">Pagos</option>
          </select>
          <input
            type="text"
            placeholder="Buscar descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Lista de movimientos */}
        <div className="transactions">
          {status === "loading" && <p>Cargando movimientos...</p>}
          {status === "error" && <p className="error">Error al cargar movimientos.</p>}
          {status === "empty" && <p>No hay movimientos.</p>}
          {status === "ready" && filtered.length === 0 && <p>No hay coincidencias.</p>}

          {status === "ready" &&
            filtered.map((t) => (
              <div
                key={t.id}
                className={`transaction-item ${expandedId === t.id ? "expanded" : ""} ${
                  t.tipo === "PAGO" || t.tipo === "COMPRA"
                    ? "transaction-debit"
                    : "transaction-credit"
                }`}
                onClick={() => toggleExpand(t.id)}
              >
                <details>
                  <summary className="transaction-summary">
                    <span className="transaction-desc">{t.descripcion}</span>
                    <p>
                      {new Date(t.fecha).toLocaleString("es-CR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                    <span className="transaction-amount">
                      {t.moneda} {t.saldo.toFixed(2)}
                    </span>
                  </summary>

                  {expandedId === t.id && (
                    <div className="transaction-details">
                      <p><strong>ID:</strong> {t.id}</p>
                      <p><strong>Card ID:</strong> {t.card_id}</p>
                      <p><strong>Fecha:</strong> {new Date(t.fecha).toLocaleString()}</p>
                      <p><strong>Tipo:</strong> {t.tipo}</p>
                      <p><strong>Descripción:</strong> {t.descripcion}</p>
                      <p><strong>Moneda:</strong> {t.moneda}</p>
                      <p><strong>Saldo:</strong> {t.saldo.toFixed(2)}</p>
                    </div>
                  )}
                </details>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
