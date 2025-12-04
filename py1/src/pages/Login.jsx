import { useState } from "react";
import "../assets/css/Login.css";
import { useNavigate } from "react-router-dom";
import PasswordRecovery from "./PasswordRecovery.jsx";
import TermsAndConditionsModal from "./TermsAndConditionsModal.jsx";
import Messages from "../assets/components/Messages.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Usa variables de entorno
const API_URL = process.env.REACT_APP_API_URL || "https://bancoastralis-api.up.railway.app/api/v1";
const API_KEY = process.env.REACT_APP_API_KEY

export default function LoginRegisterForm() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    identificacion: "",
    identificacionNumero: "",
    username: "",
    name: "",
    dob: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

   // ESTADO PARA MANEJAR MENSAJES
  const [message, setMessage] = useState({
    show: false,
    text: "",
    type: "info" // 'success', 'error', 'warning', 'info'
  });

  // FUNCION HELPER PARA MOSTRAR MENSAJES
  const showMessage = (text, type = "info") => {
    setMessage({ show: true, text, type });
  };

  // FUNCIoN PARA CERRAR EL MENSAJE
  const closeMessage = () => {
    setMessage({ show: false, text: "", type: "info" });
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  //  Función actualizada con API Key
  const handleAcceder = async () => {
    const { username, password } = loginData;
    
    if (!username || !password) {
      showMessage("Por favor, complete todos los campos.", "warning");
      return;
    }

    // Verificación de seguridad
    if (!API_KEY) {
      console.error("API_KEY no está configurada en .env");
     showMessage("Error de configuración. Contacte al administrador.", "error");
      return;
    }

    setIsLoading(true);

    const payload = {
      user: username.trim(),
      password: password,
    };
    
    console.log(" Datos enviados:", payload);
    console.log(" URL:", `${API_URL}/auth/login`);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY, // Header requerido por middleware
        },
        body: JSON.stringify(payload),
      });

      console.log("Status:", response.status);
      
      const data = await response.json();
      console.log("Respuesta:", data);

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
          showMessage("¡Inicio de sesión exitoso!", "success");
        
        setLoginData({ username: "", password: "" });
        setShowLoginPassword(false);
        
        navigate('/dashboard');
        console.log("Usuario autenticado:", data.user);
      } else {
        console.error("Error:", data);
       showMessage(data.message || data.error || "Credenciales incorrectas", "error");
      }
    } catch (error) {
      console.error("Error de red:", error);
      showMessage("Error de conexión con el servidor. Por favor, intente nuevamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // sin cambios (handleTermsCheckboxClick, handleTermsAccept, etc.)

  const handleTermsCheckboxClick = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
  };

  const handleTermsModalClose = () => {
    setShowTermsModal(false);
  };

  // Handle Registro actualizado

 const handleRegistrarme = async () => {
  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
    identificacion,
    identificacionNumero,
    dob,
    username,
  } = registerData;

  // Validaciones
  if (
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    !identificacion ||
    !identificacionNumero ||
    !dob ||
    !username
  ) {
      showMessage("Por favor complete todos los campos.", "warning");
      return;
    }

    if (!termsAccepted) {
      showMessage("Debe aceptar los términos y condiciones para continuar.", "warning");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      showMessage("El nombre solo puede contener letras y espacios.", "error");
      return;
    }

    if (!/^[a-z0-9._-]{4,20}$/.test(username)) {
      showMessage("El usuario debe tener entre 4 y 20 caracteres, usando solo minúsculas, números o . _ -", "error");
      return;
    }

    const normalizedEmail = email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showMessage("Ingrese un correo electrónico válido.", "error");
      return;
    }

    if (identificacion === "CR") {
      if (!/^\d-\d{4}-\d{4}$/.test(identificacionNumero)) {
        showMessage("La cédula nacional debe tener el formato #-####-####", "error");
        return;
      }
    } else if (identificacion === "DX") {
      if (!/^\d{11,12}$/.test(identificacionNumero)) {
        showMessage("El DIMEX debe tener entre 11 y 12 dígitos numéricos.", "error");
        return;
      }
    } else if (identificacion === "Passp") {
      if (!/^[A-Z0-9]{6,12}$/.test(identificacionNumero)) {
        showMessage("El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos en mayúscula.", "error");
        return;
      }
    } else if (identificacion === "JUR") {
      if (!/^\d-\d{3}-\d{3}$/.test(identificacionNumero) &&
          !/^\d{10}$/.test(identificacionNumero)) {
        showMessage("La cédula jurídica debe tener el formato #-###-### o 10 dígitos numéricos.", "error");
        return;
      }
    }

    if (phone && !/^\+506\s?\d{4}-\d{4}$/.test(phone)) {
      showMessage("El teléfono debe tener el formato +506 ####-####", "error");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      showMessage("La contraseña debe tener mínimo 8 caracteres, incluir al menos una mayúscula, una minúscula y un número.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Las contraseñas no coinciden.", "error");
      return;
    }

    setIsLoading(true);

  // Separa nombre completo en nombre y apellido
  const nameParts = name.trim().split(/\s+/);
  const nombre = nameParts[0];
  const apellido = nameParts.slice(1).join(" ") || nombre;

  // Mapea tipo de identificación al formato que espera la API
const tipoIdentificacionMap = {
  "CR": "Cédula Física",
  "DX": "DIMEX",
  "Passp": "Pasaporte",
  "JUR": "Cédula Jurídica"
};


 
  const payload = {
    nombre: nombre,
    apellido: apellido,
    correo: normalizedEmail,
    usuario: username,
    password: password,
    identificacion: identificacionNumero,
    tipo_identificacion: tipoIdentificacionMap[identificacion],
    rol: "cliente", // Rol fijo para nuevos registros
    telefono: phone,
    fecha_nacimiento: dob,
  };

  console.log("Datos de registro enviados:", payload);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    console.log("Status:", response.status);
    
    const data = await response.json();
    console.log("Respuesta:", data);

    if (response.ok) {
      showMessage("¡Registro exitoso! Ahora puede iniciar sesión.", "success");
      
      // Reinicia el formulario SOLO si fue exitoso
      setRegisterData({
        identificacion: "",
        identificacionNumero: "",
        username: "",
        name: "",
        dob: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTermsAccepted(false);
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);

      // Pasa a login automáticamente
      toggleToLogin();
    } else {
      console.error("Error:", data);
      showMessage(data.message || "Error al registrar usuario. Intente nuevamente.", "error");
    }
  } catch (error) {
    console.error("Error de red:", error);
      showMessage("Error de conexión con el servidor. Por favor, intente nuevamente.", "error");
  } finally {
    setIsLoading(false);
  }
};

  const toggleToLogin = () => {
    setShowLogin(true);
  };

  const toggleToRegister = () => {
    setShowLogin(false);
  };

  const backToLogin = () => {
    setShowLogin(true);
    setTermsAccepted(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenPasswordRecovery = () => {
    setShowPasswordRecovery(true);
  };

  const handleClosePasswordRecovery = () => {
    setShowPasswordRecovery(false);
  };

  const handlePasswordRecoverySuccess = () => {
    setLoginData({ username: "", password: "" });
    setShowLoginPassword(false);
  };

  return (
    <>
      <main className="main-container">
        <div className="form-wrapper">
          {showLogin ? (
            <>
              <div className="form-panel">
                <div className="form-content">
                  <h2 className="form-title">Iniciar Sesión</h2>

                  <div className="input-group">
                    <div>
                      <input
                        type="text"
                        placeholder="Usuario"
                        className="form-input"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({ ...loginData, username: e.target.value })
                        }
                        disabled={isLoading}
                        autoComplete="off"
                      />
                    </div>

                    <div className="password-input-container">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        className="form-input password-input"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        disabled={isLoading}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={toggleLoginPasswordVisibility}
                        aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={isLoading}
                      >
                        {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <button 
                      onClick={handleAcceder} 
                      className="form-button"
                      disabled={isLoading}
                    >
                      {isLoading ? "Cargando..." : "Acceder"}
                    </button>

                    <button
                      onClick={handleOpenPasswordRecovery}
                      className="recover-password-button"
                      disabled={isLoading}
                    >
                      ¿Olvidó su usuario o contraseña?
                    </button>
                  </div>
                </div>
              </div>

              <div className="promo-panel">
                <h2 className="promo-title">¿Aún No Tienes una Cuenta?</h2>
                <p className="promo-text">
                  Regístrate para acceder a todos nuestros servicios bancarios
                </p>
                <button onClick={toggleToRegister} className="promo-button">
                  Registrarme
                </button>
              </div>
            </>
          ) : (
            <div className="register-full-panel">
              {/* Codigo de registro  */}
              <div className="register-header">
                <button onClick={backToLogin} className="back-button">
                  ←
                </button>
              </div>

              <div className="form-content-center">
                <h2 className="form-title-large">Crear Nueva Cuenta</h2>
                <p className="form-subtitle">
                  Complete el formulario para crear su cuenta bancaria
                </p>

                <div className="input-group-large">
                  <div className="input-row">
                    <select
                      className="form-input"
                      value={registerData.identificacion}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          identificacion: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="" disabled hidden>
                        Seleccione una opción
                      </option>
                      <option value="DIMEX">DIMEX</option>
                      <option value="Passp">Pasaporte</option>
                      <option value="CR">Cédula Física</option>
                      <option value="JUR">Cédula Jurídica</option>
                    </select>
                  </div>

                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="Número de identificación"
                      className="form-input"
                      value={registerData.identificacionNumero || ""}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          identificacionNumero: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="Usuario"
                      className="form-input"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      className="form-input"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="input-row-labeled">
                    <p className="input-label">Fecha de nacimiento</p>
                    <input
                      type="date"
                      className="form-input"
                      value={registerData.dob}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          dob: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="input-row">
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      className="form-input"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="input-row-labeled">
                    <p className="input-label">Número de teléfono</p>
                    <div className="input-row flex">
                      <span className="prefix">+506</span>
                      <input
                        type="tel"
                        placeholder="####-####"
                        className="form-input"
                        value={registerData.phone.replace("+506", "").trim()}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, "");
                          if (digits.length > 8) digits = digits.slice(0, 8);
                          const formatted =
                            digits.length > 4
                              ? `${digits.slice(0, 4)}-${digits.slice(4)}`
                              : digits;
                          setRegisterData({
                            ...registerData,
                            phone: formatted ? `+506 ${formatted}` : "",
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="password-input-container">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      className="form-input password-input"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={toggleRegisterPasswordVisibility}
                      aria-label={showRegisterPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showRegisterPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar Contraseña"
                      className="form-input password-input"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={toggleConfirmPasswordVisibility}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  <div className="terms-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={termsAccepted}
                        onChange={handleTermsCheckboxClick}
                        required
                      />
                      <span className="checkbox-text">
                        Acepto los{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="terms-link"
                        >
                          términos y condiciones
                        </button>{" "}
                        del servicio bancario
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleRegistrarme}
                    className="form-button-large"
                  >
                    Crear Cuenta Bancaria
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showPasswordRecovery && (
        <PasswordRecovery
          onClose={handleClosePasswordRecovery}
          onSuccess={handlePasswordRecoverySuccess}
        />
      )}

      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={handleTermsModalClose}
        onAccept={handleTermsAccept}
      />
       {/* Componente de mensajes */}
      <Messages 
        show={message.show}
        text={message.text}
        type={message.type}
        onClose={closeMessage}
      />
    </>
  );
}