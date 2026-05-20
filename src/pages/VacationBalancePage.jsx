import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getApiErrorMessage } from '../api/axiosConfig';
import { createVacationBalance } from '../api/vacationApi';

const VacationBalancePage = () => {
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    setSuccess('');

    try {
      await createVacationBalance({
        accrualPeriod: Number(data.accrualPeriod),
        balance: Number(data.balance),
        userSumaryId: Number(data.userSumaryId),
      });
      setSuccess('Periodo aquisitivo registrado com sucesso.');
      reset();
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="content-section narrow">
      <div className="section-header">
        <div>
          <h1>Saldo de Ferias</h1>
          <p>Registre periodo aquisitivo e saldo de dias.</p>
        </div>
      </div>

      {apiError && <div className="alert alert-error">{apiError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Periodo aquisitivo
          <input type="number" {...register('accrualPeriod', { required: 'Periodo e obrigatorio' })} />
          {errors.accrualPeriod && <span className="field-error">{errors.accrualPeriod.message}</span>}
        </label>

        <label>
          Saldo
          <input type="number" {...register('balance', { required: 'Saldo e obrigatorio' })} />
          {errors.balance && <span className="field-error">{errors.balance.message}</span>}
        </label>

        <label>
          ID do usuario
          <input type="number" {...register('userSumaryId', { required: 'ID do usuario e obrigatorio' })} />
          {errors.userSumaryId && <span className="field-error">{errors.userSumaryId.message}</span>}
        </label>

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Saldo'}
        </button>
      </form>
    </section>
  );
};

export default VacationBalancePage;
