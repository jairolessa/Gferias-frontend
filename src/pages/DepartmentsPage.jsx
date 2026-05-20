import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/axiosConfig';
import { getDepartments } from '../api/departmentsApi';
import LoadingSpinner from '../components/LoadingSpinner';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError));
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Departamentos</h1>
          <p>Consulte departamentos e usuarios associados.</p>
        </div>
        <Link className="button" to="/departments/new">
          Novo Departamento
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
                <th>Departamento</th>
                <th>Usuarios</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.id}</td>
                  <td>{department.departmentName}</td>
                  <td>
                    {department.users?.length
                      ? department.users.map((user) => user.fullName).join(', ')
                      : 'Nenhum usuario associado'}
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="3" className="empty-cell">
                    Nenhum departamento encontrado.
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

export default DepartmentsPage;
