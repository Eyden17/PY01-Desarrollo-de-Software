import { useState } from "react";
import "../css/home.css";
import logo from "../img/logo_example.png";
import Footer from "../components/Footer";

function Home() {
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <div className="container">
      {/* Barra de navegación */}
      <nav className="navbar">
        <a href="/">
           <img className="logo" src={logo} alt="Logo de la página" />
        </a>

        <div className="nav-links">
          <button onClick={() => openModal("about")}>About</button>
          <button onClick={() => openModal("contact")}>Contact</button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        <h1>Aqui va el iniciar sesión | Crear cuenta</h1>
      </main>

       {/* Footer reutilizable */}
      <Footer />

   

      {/* Modal */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              &times;
            </button>
            <div id="modal-body">
              {/* Aquí podrías renderizar dinámicamente el contenido según modalType */}
              {modalType === "about" && <p>Información sobre nosotros...</p>}
              {modalType === "contact" && <p>Formulario de contacto...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
