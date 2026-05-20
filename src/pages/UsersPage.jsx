import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/axiosConfig';
import { getUsers } from '../api/usersApi';
import LoadingSpinner from '../components/LoadingSpinner';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Usuarios</h1>
          <p>Consulte e gerencie os usuarios cadastrados.</p>
        </div>
        <Link className="button" to="/users/new">
          Novo Usuario
        </Link>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Tipo</th>
                <th>Role</th>
                <th>Ativo</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.jobTitle}</td>
                  <td>{user.userType}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? 'Sim' : 'Nao'}</td>
                  <td>
                    <Link className="table-link" to={`/users/${user.id}/edit`}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    Nenhum usuario encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default UsersPage;
