import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react";

import "../assets/css/AccountPage.css";

import { apiGet } from "../services/apiClient";
import { getCurrentUser } from "../services/authService";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const formatCurrency = (amount, currency) => {
  const formattedAmount = Math.abs(Number(amount) || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  return currency === "CRC" ? `₡${formattedAmount}` : `$${formattedAmount}`;
};

export default function AccountPage() {
  const { id } = useParams(); // account_id (UUID)
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);

  const [movements, setMovements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // ============ 1) Proteger ruta y cargar datos de la cuenta ============
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }

    if (!id) {
      navigate("/dashboard");
      return;
    }

    const loadAccount = async () => {
      try {
        setStatus("loading");
        setErrorMsg(null);

        // GET /api/v1/accounts/:id
        const res = await apiGet(`/accounts/${id}`);

        console.log("Respuesta cuenta:", res);

        let accRow = null;

        if (Array.isArray(res) && res.length > 0) {
          accRow = res[0];
        }
        else if (Array.isArray(res?.data) && res.data.length > 0) {
          accRow = res.data[0];
        }
        else if (res?.data && !Array.isArray(res.data)) {
          accRow = res.data;
        }

        if (!accRow) {
          setErrorMsg("No se encontró la cuenta.");
          setStatus("error");
          return;
        }

        const mappedAccount = {
          account_id: accRow.id,
          iban: accRow.iban,
          alias: accRow.alias || accRow.iban || "Cuenta Astralis",
          type: accRow.tipo_cuenta_nombre || "Cuenta Astralis",
          balance: Number(accRow.saldo ?? 0),
          currency: accRow.moneda_iso || accRow.moneda_nombre || "CRC",
        };

        setAccount(mappedAccount);
        console.log("Cuenta cargada:", mappedAccount);
        setStatus("ready");
      } catch (err) {
        console.error("Error cargando cuenta:", err);
        setErrorMsg("Error al cargar la cuenta.");
        setStatus("error");
      }
    };

    loadAccount();
  }, [id, navigate]);

  // ============ 2) Cargar movimientos de la cuenta (cuando ya tenemos IBAN) ============
  useEffect(() => {
    if (!account?.iban) return;

    const loadMovements = async () => {
      try {
        setStatus("loading");
        setErrorMsg(null);

        const res = await apiGet(
          `/accounts/${encodeURIComponent(
            account.iban
          )}/movements?page=1&page_size=50`
        );

        console.log("Respuesta movimientos:", res);

        let payload;

        if (res && Array.isArray(res.items)) {
          payload = res;
        } else if (res && res.data) {
          payload = res.data;
        } else {
          payload = {};
        }

        const items = Array.isArray(payload.items) ? payload.items : [];

        const mappedMovements = items.map((m) => {
          const rawType = (
            m.tipo_nombre ||
            m.tipo_texto ||
            m.tipo ||
            ""
          )
            .toString()
            .toUpperCase();

          let type = "OTRO";
          if (rawType.includes("CRÉDITO") || rawType.includes("CREDITO")) {
            type = "CREDITO";
          } else if (rawType.includes("DÉBITO") || rawType.includes("DEBITO")) {
            type = "DEBITO";
          }

          return {
            id: m.id,
            account_id: account.account_id,
            type,
            description: m.descripcion || m.description || "Movimiento",
            date: m.fecha || m.date,
            balance: m.monto ?? m.balance ?? 0,
            currency: m.moneda_iso || m.moneda || account.currency,
          };
        });

        console.log("Movimientos mapeados:", mappedMovements);

        setMovements(mappedMovements);
        setFiltered(mappedMovements);

        if (mappedMovements.length === 0) {
          setStatus("empty");
        } else {
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error cargando movimientos:", err);
        setErrorMsg("Error al cargar movimientos.");
        setStatus("error");
      }
    };

    loadMovements();
  }, [account]);

  // ============ 3) Filtros (tipo y búsqueda) ============
  useEffect(() => {
    let result = [...movements];

    if (filterType !== "ALL") {
      result = result.filter((m) => m.type === filterType);
    }

    if (search.trim()) {
      result = result.filter((m) =>
        (m.description || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [filterType, search, movements]);

  if (!account) {
    if (status === "error") {
      return (
        <main className="account-page">
          <header className="acc-header">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={18} />
              <span>Volver</span>
            </button>
            <h1 className="header-title">Cuenta</h1>
          </header>
          <section className="account-content">
            <p className="state-text error">
              {errorMsg || "Error al cargar la cuenta."}
            </p>
          </section>
        </main>
      );
    }
    return null;
  }

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
              <p className="label">IBAN</p>
              <p className="value">{account.iban}</p>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filter-card">
          <h3 className="filter-title">Movimientos</h3>

          <div className="filters">
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
              <p className="state-text error">
                {errorMsg || "Error al cargar movimientos"}
              </p>
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
                        <span className="label">IBAN:</span>
                        <span className="value">{account.iban}</span>
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
