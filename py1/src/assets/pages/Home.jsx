import { useState } from "react";
import "../css/home.css";
import logo from "../img/logo_example.png";
import Footer from "../components/Footer";
import modalContent from "../../data/home.js";
import LoginRegisterForm from "./Login.jsx";



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
          <LoginRegisterForm />
      </main>

       {/* Footer reutilizable */}
      <Footer />

      {/* Modal */}
        {modalType && (
        <div
          className="modal-overlay show"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              &times;
            </button>
            <h2 className="modal-title">{modalContent[modalType].title}</h2>
            <div className="modal-text">{modalContent[modalType].content}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
