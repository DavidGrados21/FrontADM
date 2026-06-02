import { useState } from "react";
import "./Login.css";
import VistaPersonal from "../VistaPersonal/VistaPersonal";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [logueado, setLogueado] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleSubmit = (e) => {  
    e.preventDefault();

    console.log("Correo:", correo);
    console.log("Password:", password);

    setErrorCorreo("");
    setErrorPassword("");

    let hayError = false

    if (correo !== "admin@admin.com") {
        setErrorCorreo("Correo incorrecto");
        hayError = true;
    }

    if (password !== "admin") {
        setErrorPassword("Contraseña incorrecta");
        hayError = true;
    }

    if (!hayError) {
        setLogueado(true);
    }
  };

  if (logueado) {
    return <VistaPersonal />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            {errorCorreo && (
                <span className="error-message">
                    {errorCorreo}
                </span>
            )}
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorPassword && (
                <span className="error-message">
                    {errorPassword}
                </span>
            )}
          </div>

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;