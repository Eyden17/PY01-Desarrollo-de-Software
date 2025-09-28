import { useState, useEffect } from "react";
import "../css/Login.css";
import PasswordRecovery from "./PasswordRecovery.jsx";
import TermsAndConditionsModal from "./TermsAndConditionsModal.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function LoginRegisterForm() {
  const [showLogin, setShowLogin] = useState(true);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
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
  const [testUser, setTestUser] = useState(null);

  // Carga usuario de prueba desde JSON
  useEffect(() => {
    const loadTestUser = async () => {
      try {
        const response = await fetch('/assets/js/user.json');
        const data = await response.json();
        setTestUser(data.testUser);
      } catch (error) {
        console.error('Error al cargar el usuario de prueba:', error);
        // Fallback en caso de error
        setTestUser({
          username: "josesolano",
          password: "123456"
        });
      }
    };

    loadTestUser();
  }, []);

  // Funciones para mostrar/ocultar contraseñas
  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  //Validacion para acceder.
  const handleAcceder = () => {

    // TESTING PURPOSES
    window.location.href = "/dashboard";
    return;

    console.log("Datos de inicio de sesión:", loginData);
    const { username, password } = loginData;
    
    if (!username || !password) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (!testUser) {
      alert("Error al cargar los datos del usuario.");
      return;
    }

    if (username === testUser.username && password === testUser.password) {
      alert("Inicio de sesión exitoso");
      // Reinicia los valores del iniciar sesion
      setLoginData({ username: "", password: "" });
      
      //EYDEN aqui va la redireccion al modulo del banco
      
      console.log("Redirigiendo al módulo del banco...");
      
    } else {
      alert("Credenciales incorrectas");
    }
  };

  // Manejo de términos y condiciones
  const handleTermsCheckboxClick = (e) => {
    e.preventDefault(); // Previene el cambio automático del checkbox
    setShowTermsModal(true);
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
  };

  const handleTermsModalClose = () => {
    setShowTermsModal(false);
  };

  //Validacion para Registro.
  const handleRegistrarme = () => {
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
      alert("Por favor complete todos los campos.");
      return;
    }

    // Validación de términos y condiciones
    if (!termsAccepted) {
      alert("Debe aceptar los términos y condiciones para continuar.");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      alert("El nombre solo puede contener letras y espacios.");
      return;
    }

    // Username: 4–20 caracteres, minúsculas, números y ._-
    if (!/^[a-z0-9._-]{4,20}$/.test(username)) {
      alert(
        "El usuario debe tener entre 4 y 20 caracteres, usando solo minúsculas, números o . _ -"
      );
      return;
    }

    // Email: formato estándar y convertir a minúsculas
    const normalizedEmail = email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      alert("Ingrese un correo electrónico válido.");
      return;
    }
    registerData.email = normalizedEmail;

    // Validar identificación según tipo
    if (identificacion === "CR") {
      if (!/^\d-\d{4}-\d{4}$/.test(identificacionNumero)) {
        alert("La cédula nacional debe tener el formato #-####-####");
        return;
      }
    } else if (identificacion === "DX") {
      if (!/^\d{11,12}$/.test(identificacionNumero)) {
        alert("El DIMEX debe tener entre 11 y 12 dígitos numéricos.");
        return;
      }
    } else if (identificacion === "Passp") {
      if (!/^[A-Z0-9]{6,12}$/.test(identificacionNumero)) {
        alert(
          "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos en mayúscula."
        );
        return;
      }
    }

    // Teléfono: valida formato +506 ####-####
    if (phone && !/^\+506\s?\d{4}-\d{4}$/.test(phone)) {
      alert("El teléfono debe tener el formato +506 ####-####");
      return;
    }

    // Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      alert(
        "La contraseña debe tener mínimo 8 caracteres, incluir al menos una mayúscula, una minúscula y un número."
      );
      return;
    }

    // Confirmación de contraseña
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    alert("Registro exitoso ");
     // Reinicia los valores del formulario
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

    // Reset términos y condiciones
    setTermsAccepted(false);

    // Reset estados de visibilidad de contraseña
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);

    // Pasar a login automáticamente
    toggleToLogin();
  };

  const toggleToLogin = () => {
    setShowLogin(true);
  };

  const toggleToRegister = () => {
    setShowLogin(false);
  };

  const backToLogin = () => {
    setShowLogin(true);
    // Reset términos cuando regresa al login
    setTermsAccepted(false);
    // Reset estados de visibilidad de contraseña
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
    // limpia el formulario de login o mostrar mensaje
    setLoginData({ username: "", password: "" });
    setShowLoginPassword(false);
  };

  return (
    <>
      <main className="main-container">
        <div className="form-wrapper">
          {showLogin ? (
            // Vista de Login (por defecto)
            <>
              {/* Panel de Inicio de Sesión (izquierda) */}
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
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={toggleLoginPasswordVisibility}
                        aria-label={showConfirmPassword  ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                         {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <button onClick={handleAcceder} className="form-button">
                      Acceder
                    </button>

                    <button
                      onClick={handleOpenPasswordRecovery}
                      className="recover-password-button"
                    >
                      ¿Olvidó su usuario o contraseña?
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel promocional (derecha) */}
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
            // Vista de Registro completa
            <div className="register-full-panel">
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
                  {/*Aqui inician los input y comboBox*/}
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
                      <option value="CR">Nacional</option>
                      <option value="DX">DIMEX</option>
                      <option value="Passp">Pasaporte</option>
                    </select>
                  </div>
                  {/* Número de identificación */}
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

                  {/* Username */}
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

                  {/* Fecha de nacimiento */}
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

                  {/* Teléfono */}
                  <div className="input-row-labeled">
                    <p className="input-label">Número de teléfono</p>
                    <div className="input-row flex">
                      <span className="prefix">+506</span>
                      <input
                      //Ayuda de chat GPT para formatear el teléfono
                        type="tel"
                        placeholder="####-####"
                        className="form-input"
                        value={registerData.phone.replace("+506", "").trim()}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, ""); // solo números
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

                  {/* Contraseña con botón mostrar/ocultar */}
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

                  {/* Confirmar contraseña con botón mostrar/ocultar */}
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

      {/* Modal de Recuperación de Contraseña */}
      {showPasswordRecovery && (
        <PasswordRecovery
          onClose={handleClosePasswordRecovery}
          onSuccess={handlePasswordRecoverySuccess}
        />
      )}

      {/* Modal de Términos y Condiciones */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={handleTermsModalClose}
        onAccept={handleTermsAccept}
      />
    </>
  );
}