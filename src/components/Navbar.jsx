import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <div>
        <strong className="brand">Gferias</strong>
      </div>
      <nav className="nav-links" aria-label="Navegacao principal">
        {isAdmin && (
          <>
            <NavLink to="/users">Usuarios</NavLink>
            <NavLink to="/departments">Departamentos</NavLink>
          </>
        )}
        <NavLink to="/vacation-balance">Saldo de Ferias</NavLink>
        <NavLink to="/vacation">Ferias</NavLink>
      </nav>
      <button className="button button-secondary" type="button" onClick={handleLogout}>
        Sair
      </button>
    </header>
  );
};

export default Navbar;
