import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setApiError('');

    try {
      const authData = await login(data.cpf, data.password);
      const fromPath = location.state?.from?.pathname;
      const defaultPath = authData.isAdmin ? '/users' : '/vacation-balance';
      const adminPaths = ['/users', '/departments'];
      const isAdminPath = fromPath && adminPaths.some((path) => fromPath.startsWith(path));
      const destination = fromPath && (!isAdminPath || authData.isAdmin) ? fromPath : defaultPath;
      navigate(destination, { replace: true });
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Gferias</h1>
        <p>Entre com CPF e senha para acessar o painel.</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          <label>
            CPF
            <input type="text" {...register('cpf', { required: 'CPF e obrigatorio' })} />
            {errors.cpf && <span className="field-error">{errors.cpf.message}</span>}
          </label>

          <label>
            Senha
            <input type="password" {...register('password', { required: 'Senha e obrigatoria' })} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
