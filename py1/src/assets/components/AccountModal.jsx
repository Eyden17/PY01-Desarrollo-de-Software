import React, { useEffect, useState } from "react";
import "../css/modal.css";
import movementsData from "../../data/movements.json";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const AccountModal = ({ account, onClose }) => {
  const [movements, setMovements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setStatus("loading");
    setTimeout(() => {
      try {
        const accountMovs = movementsData.filter(
          (m) => m.account_id === account.account_id
        );
        setMovements(accountMovs);
        setFiltered(accountMovs);
        setStatus(accountMovs.length ? "ready" : "empty");
      } catch {
        setStatus("error");
      }
    }, 800);
  }, [account]);

  useEffect(() => {
    let result = [...movements];
    if (filterType !== "ALL") {
      result = result.filter((m) => m.type.toUpperCase() === filterType);
    }
    if (search.trim()) {
      result = result.filter((m) =>
        m.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [filterType, search, movements]);

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
        <header className="modal-header">
          <h2>{account.alias}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <section className="modal-account-info">
          <p><strong>Número:</strong> {account.account_id}</p>
          <p><strong>Tipo:</strong> {account.type}</p>
          <p><strong>Moneda:</strong> {account.currency}</p>
          <p><strong>Saldo:</strong> {account.balance.toFixed(2)}</p>
        </section>

        <section className="modal-filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="CREDITO">Créditos</option>
            <option value="DEBITO">Débitos</option>
          </select>
          <input
            type="text"
            placeholder="Buscar descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        <section className="modal-movements">
          {status === "loading" && <p>Cargando movimientos...</p>}
          {status === "error" && <p className="error">Error al cargar movimientos.</p>}
          {status === "ready" && filtered.length === 0 && <p>No hay movimientos para mostrar.</p>}

          <ul className="movements-list">
            {status === "ready" &&
              filtered.map((m) => (
                <li key={m.id} className={`movement movement--${m.type.toLowerCase()}`}>
                  <details open={expandedId === m.id}>
                    <summary
                      className="movement-summary"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(m.id);
                      }}
                    >
                      <span className="movement-desc">{m.description}</span>
                      <span>
                        {new Date(m.date).toLocaleString("es-CR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="movement-amount">
                        {m.currency} {m.balance.toFixed(2)}
                      </span>
                    </summary>

                    {expandedId === m.id && (
                      <div className="movement-details">
                        <p><strong>ID:</strong> {m.id}</p>
                        <p><strong>Cuenta:</strong> {m.account_id}</p>
                        <p><strong>Fecha:</strong> {formatDate(m.date)}</p>
                        <p><strong>Tipo:</strong> {m.type}</p>
                        <p><strong>Descripción:</strong> {m.description}</p>
                        <p><strong>Moneda:</strong> {m.currency}</p>
                        <p><strong>Monto:</strong> {m.balance.toFixed(2)}</p>
                      </div>
                    )}
                  </details>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AccountModal;
