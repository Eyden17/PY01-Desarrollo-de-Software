import { useState } from "react";
import '../css/Login.css';

export default function LoginRegisterForm() {
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    name: "", 
    email: "", 
    username: "", 
    password: "",
    confirmPassword: ""
  });

    // Usuario de prueba
  const testUser = {
    email: "josesolanovargas13@gmail.com",
    password: "123456"
  };

  const handleAcceder = () => {
    console.log("Datos de inicio de sesión:", loginData);
    const { email, password } = loginData;
    if (!email || !password) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (email === testUser.email && password === testUser.password) {
      alert(" Inicio de sesión exitoso");
    } else {
      alert(" Credenciales incorrectas");
    }

  };

    const handleRegistrarme = () => {
    const { name, email, username, password, confirmPassword } = registerData;

    // Validaciones
    if (!name || !email || !username || !password || !confirmPassword) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      alert("El nombre solo puede contener letras y espacios.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Ingrese un correo electrónico válido.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    alert("✅ Registro exitoso (aquí iría la lógica real)");
    console.log("Datos de registro:", registerData);
    //Se envia al login al crear el usuario
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
  };

  return (
    <main className="main-container">
      <div className="form-wrapper">
        
        {showLogin ? (
          // Vista de Login (por defecto)
          <>
            {/* Panel de Inicio de Sesión (izquierda) */}
            <div className="form-panel">
              <div className="form-content">
                <h2 className="form-title">
                  Iniciar Sesión
                </h2>

                <div className="input-group">
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      className="form-input"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      className="form-input"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                  </div>

                  <button
                    onClick={handleAcceder}
                    className="form-button"
                  >
                    Acceder
                  </button>

                   <button 
                onClick={"/"}
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
              <button
                onClick={toggleToRegister}
                className="promo-button"
              >
                Registrarme
              </button>
            </div>
          </>
        ) : (
          // Vista de Registro completa
          <div className="register-full-panel">
            <div className="register-header">
              <button 
                onClick={backToLogin}
                className="back-button"
              >
                ←
              </button>
            </div>
            
            <div className="form-content-center">
              <h2 className="form-title-large">
                Crear Nueva Cuenta
              </h2>
              <p className="form-subtitle">
                Complete el formulario para crear su cuenta bancaria
              </p>

              <div className="input-group-large">
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    className="form-input"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  />
                </div>

                <div className="input-row">
                  <input
                    type="email"
                    placeholder="Correo Electrónico"
                    className="form-input"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  />
                </div>

                <div className="input-row">
                  <input
                    type="text"
                    placeholder="Nombre de Usuario"
                    className="form-input"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  />
                </div>

                <div className="input-row">
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="form-input"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                </div>

                <div className="input-row">
                  <input
                    type="password"
                    placeholder="Confirmar Contraseña"
                    className="form-input"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  />
                </div>

                <div className="terms-row">
                  <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" required />
                    <span className="checkbox-text">
                      Acepto los términos y condiciones del servicio bancario
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
  );
}