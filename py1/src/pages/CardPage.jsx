import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ShoppingBag, Wallet, Eye } from "lucide-react";

import CreditCard from "../assets/components/CreditCard.jsx";
import "../assets/css/CardPage.css";

import { apiGet } from "../services/apiClient";
import { getCurrentUser } from "../services/authService";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const formatCurrency = (amount, currency) => {
  const num = Number(amount) || 0;
  const formattedAmount = Math.abs(num)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  return currency === "CRC" ? `₡${formattedAmount}` : `$${formattedAmount}`;
};

export default function CardPage() {
  const { id: cardId } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filterType, setFilterType] = useState("ALL"); 
  const [search, setSearch] = useState("");

  const [cardStatus, setCardStatus] = useState("loading");
  const [txStatus, setTxStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

  // ========= Proteger ruta y cargar datos =========
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }

    if (!cardId) {
      navigate("/dashboard");
      return;
    }

    const loadCard = async () => {
      try {
        setCardStatus("loading");

        const res = await apiGet(`/cards/${cardId}`);
        const data = res?.data || res; 

        if (!data) {
          setCardStatus("error");
          return;
        }

        const mappedCard = {
          id: data.id,
          type: data.tipo_tarjeta?.nombre || "Tarjeta Astralis",
          number: data.numero_enmascarado,
          exp: data.fecha_expiracion,
          holder: data.titular || "Cliente Astralis",
          vendor: "MC",
          currency: data.moneda?.nombre || "CRC",
          balance: Number(data.saldo_actual ?? 0),
        };

        setCard(mappedCard);
        setCardStatus("ready");
      } catch (err) {
        console.error("Error cargando tarjeta:", err);
        setCardStatus("error");
      }
    };

    const loadMovements = async () => {
      try {
        setTxStatus("loading");

        const res = await apiGet(`/cards/${cardId}/movements?page_size=100`);
        const payload = res?.data || res;

        const movs = Array.isArray(payload?.movimientos)
          ? payload.movimientos
          : [];

        const mappedTx = movs.map((m) => ({
          id: m.id,
          fecha: m.fecha,
          descripcion: m.descripcion,
          monto: Number(m.monto ?? 0),
          tipo_nombre: m.tipo_nombre || "",
          moneda_iso: m.moneda_iso || "CRC",
          moneda_nombre: m.moneda_nombre || "Colones",
        }));

        console.log("Mapped Transactions:", mappedTx);

        setTransactions(mappedTx);
        setFiltered(mappedTx);
        setTxStatus(mappedTx.length ? "ready" : "empty");
      } catch (err) {
        console.error("Error cargando movimientos de tarjeta:", err);
        setTxStatus("error");
      }
    };

    loadCard();
    loadMovements();
  }, [cardId, navigate]);

  useEffect(() => {
    let result = [...transactions];

    if (filterType !== "ALL") {
      result = result.filter(
        (t) => t.tipo_nombre?.toUpperCase() === filterType
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        (t.descripcion || "").toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [filterType, search, transactions]);

  if (cardStatus === "loading" && !card) {
    return (
      <main className="card-page">
        <header className="card-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </header>
        <p className="state-text">Cargando tarjeta...</p>
      </main>
    );
  }

  if (cardStatus === "error" || !card) {
    return (
      <main className="card-page">
        <header className="card-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </header>
        <p className="state-text state-error">
          No se pudo cargar la tarjeta. Intenta de nuevo.
        </p>
      </main>
    );
  }

  // ========= Render principal =========
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
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todas</option>
              <option value="COMPRA">Compras</option>
              <option value="PAGO">Pagos</option>
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

          {/* LISTA */}
          <div className="movements">
            {txStatus === "loading" && (
              <p className="state-text">Cargando transacciones...</p>
            )}
            {txStatus === "error" && (
              <p className="state-text state-error">
                Error al cargar transacciones
              </p>
            )}
            {txStatus === "empty" && (
              <p className="state-text">No hay transacciones registradas</p>
            )}
            {txStatus === "ready" && filtered.length === 0 && (
              <p className="state-text">
                No hay transacciones que coincidan con el filtro
              </p>
            )}

            {txStatus === "ready" &&
              filtered.map((t) => {
                const isPago =
                  t.tipo_nombre?.toUpperCase() === "PAGO" ||
                  t.tipo_nombre?.toUpperCase() === "PAGOS";

                return (
                  <div
                    key={t.id}
                    className={`movement-card ${
                      isPago ? "border-success" : "border-primary"
                    }`}
                    onClick={() =>
                      setExpandedId(expandedId === t.id ? null : t.id)
                    }
                  >
                    <div className="movement-main">
                      <div className="movement-info">
                        {isPago ? (
                          <Wallet className="mov-icon success" />
                        ) : (
                          <ShoppingBag className="mov-icon primary" />
                        )}

                        <div>
                          <p className="mov-desc">{t.descripcion}</p>
                          <p className="mov-date">{formatDate(t.fecha)}</p>
                        </div>
                      </div>

                      <p
                        className={`mov-amount ${
                          isPago ? "success" : "primary"
                        }`}
                      >
                        {isPago ? "+" : "-"}
                        {formatCurrency(t.monto, t.moneda_iso)}
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
                          <span className="value">{t.tipo_nombre}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Moneda:</span>
                          <span className="value">
                            {t.moneda_nombre} ({t.moneda_iso})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
}
