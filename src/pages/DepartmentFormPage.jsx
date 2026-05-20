import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/axiosConfig';
import { associateUserDepartment, createDepartment, getDepartments } from '../api/departmentsApi';
import { getUsers } from '../api/usersApi';
import LoadingSpinner from '../components/LoadingSpinner';

const DepartmentFormPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    register: registerDepartment,
    handleSubmit: handleDepartmentSubmit,
    formState: { errors: departmentErrors, isSubmitting: isCreating },
  } = useForm({
    defaultValues: {
      departmentName: '',
    },
  });
  const {
    register: registerAssociation,
    handleSubmit: handleAssociationSubmit,
    formState: { errors: associationErrors, isSubmitting: isAssociating },
  } = useForm({
    defaultValues: {
      userId: '',
      departmentsIds: [],
    },
  });

  const loadPageData = async () => {
    const [usersData, departmentsData] = await Promise.all([getUsers(), getDepartments()]);
    setUsers(Array.isArray(usersData) ? usersData : []);
    setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadPageData();
      } catch (error) {
        setApiError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data) => {
    setApiError('');
    setSuccess('');

    try {
      await createDepartment({ departmentName: data.departmentName });
      setSuccess('Departamento criado com sucesso.');
      await loadPageData();
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  const onAssociate = async (data) => {
    setApiError('');
    setSuccess('');

    try {
      await associateUserDepartment(Number(data.userId), data.departmentsIds.map(Number));
      setSuccess('Usuario associado ao departamento com sucesso.');
      navigate('/departments');
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="content-section narrow">
      <div className="section-header">
        <div>
          <h1>Novo Departamento</h1>
          <p>Crie um departamento e associe usuarios quando necessario.</p>
        </div>
      </div>

      {apiError && <div className="alert alert-error">{apiError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="form-grid" onSubmit={handleDepartmentSubmit(onSubmit)}>
        <label>
          Nome do departamento
          <input type="text" {...registerDepartment('departmentName', { required: 'Nome do departamento e obrigatorio' })} />
          {departmentErrors.departmentName && <span className="field-error">{departmentErrors.departmentName.message}</span>}
        </label>

        <div className="form-actions">
          <button className="button" type="submit" disabled={isCreating}>
            {isCreating ? 'Criando...' : 'Criar Departamento'}
          </button>
          <Link className="button button-secondary" to="/departments">
            Voltar
          </Link>
        </div>
      </form>

      <hr className="divider" />

      <form className="form-grid" onSubmit={handleAssociationSubmit(onAssociate)}>
        <h2>Associar usuario a departamentos</h2>

        <label>
          Usuario
          <select {...registerAssociation('userId', { required: 'Usuario e obrigatorio' })}>
            <option value="">Selecione</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>
          {associationErrors.userId && <span className="field-error">{associationErrors.userId.message}</span>}
        </label>

        <fieldset className="checkbox-group">
          <legend>Departamentos</legend>
          {departments.map((department) => (
            <label key={department.id} className="checkbox-label">
              <input
                type="checkbox"
                value={department.id}
                {...registerAssociation('departmentsIds', { required: 'Selecione ao menos um departamento' })}
              />
              {department.departmentName}
            </label>
          ))}
          {departments.length === 0 && <p>Nenhum departamento disponivel.</p>}
          {associationErrors.departmentsIds && <span className="field-error">{associationErrors.departmentsIds.message}</span>}
        </fieldset>

        <button className="button" type="submit" disabled={isAssociating}>
          {isAssociating ? 'Associando...' : 'Associar'}
        </button>
      </form>
    </section>
  );
};

export default DepartmentFormPage;
