import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/axiosConfig';
import { createUser, getUser, updateUser } from '../api/usersApi';
import LoadingSpinner from '../components/LoadingSpinner';

const userTypeOptions = ['MANAGER', 'LEADERSHIP', 'PUBLICSERVICE'];
const roleOptions = ['ROLE_ADMIN', 'ROLE_BOSS', 'ROLE_USER'];

const UserFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      cpf: '',
      password: '',
      jobTitle: '',
      userType: 'MANAGER',
      role: 'ROLE_USER',
      active: true,
    },
  });

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadUser = async () => {
      try {
        const user = await getUser(id);
        reset({
          fullName: user.fullName || '',
          cpf: user.cpf || '',
          password: '',
          jobTitle: user.jobTitle || '',
          userType: user.userType || 'MANAGER',
          role: user.role || 'ROLE_USER',
          active: Boolean(user.active),
        });
      } catch (error) {
        setApiError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    setApiError('');

    try {
      if (isEditing) {
        const updateData = {
          fullName: data.fullName,
          jobTitle: data.jobTitle,
          userType: data.userType,
          role: data.role,
          active: data.active,
        };
        await updateUser(id, updateData);
      } else {
        await createUser(data);
      }

      navigate('/users');
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
          <h1>{isEditing ? 'Editar Usuario' : 'Novo Usuario'}</h1>
          <p>{isEditing ? 'Atualize os dados cadastrais.' : 'Cadastre um novo usuario no sistema.'}</p>
        </div>
      </div>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Nome completo
          <input type="text" {...register('fullName', { required: 'Nome e obrigatorio' })} />
          {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
        </label>

        <label>
          CPF
          <input type="text" disabled={isEditing} {...register('cpf', { required: !isEditing && 'CPF e obrigatorio' })} />
          {errors.cpf && <span className="field-error">{errors.cpf.message}</span>}
        </label>

        {!isEditing && (
          <label>
            Senha
            <input type="password" {...register('password', { required: 'Senha e obrigatoria' })} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>
        )}

        <label>
          Cargo
          <input type="text" {...register('jobTitle', { required: 'Cargo e obrigatorio' })} />
          {errors.jobTitle && <span className="field-error">{errors.jobTitle.message}</span>}
        </label>

        <label>
          Tipo de usuario
          <select {...register('userType', { required: 'Tipo e obrigatorio' })}>
            {userTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Role
          <select {...register('role', { required: 'Role e obrigatoria' })}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-label">
          <input type="checkbox" {...register('active')} />
          Usuario ativo
        </label>

        <div className="form-actions">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <Link className="button button-secondary" to="/users">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
};

export default UserFormPage;
