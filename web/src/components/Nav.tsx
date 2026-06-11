import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Nav() {
  const { user, logout } = useAuth();
  return (
    <header className="nav">
      <Link className="brand" to="/">SUPCONTENT</Link>
      <nav>
        <NavLink to="/search">Recherche</NavLink>
        <NavLink to="/library">Bibliothèque</NavLink>
        <NavLink to="/lists">Listes</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>
        <NavLink to="/messages">Messages</NavLink>
        <NavLink to="/settings">Paramètres</NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-user">
        {user ? (
          <>
            <Link to={`/users/${user.id}`}>{user.displayName}</Link>
            <button onClick={logout}>Déconnexion</button>
          </>
        ) : (
          <Link className="button" to="/login">Connexion</Link>
        )}
      </div>
    </header>
  );
}
