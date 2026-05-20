import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getApiErrorMessage } from '../api/axiosConfig';
import { createVacation } from '../api/vacationApi';

const daysOptions = ['THIRTY', 'TWENTY', 'FIFTEEN', 'TEN'];

const VacationPage = () => {
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      days: 'THIRTY',
    },
  });

  const onSubmit = async (data) => {
    setApiError('');
    setSuccess('');

    try {
      await createVacation({
        startDate: data.startDate,
        days: data.days,
        vacationBalanceId: Number(data.vacationBalanceId),
      });
      setSuccess('Ferias programadas com sucesso.');
      reset({ days: 'THIRTY' });
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="content-section narrow">
      <div className="section-header">
        <div>
          <h1>Ferias</h1>
          <p>Programe o periodo de gozo.</p>
        </div>
      </div>

      {apiError && <div className="alert alert-error">{apiError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Data de inicio
          <input type="date" {...register('startDate', { required: 'Data de inicio e obrigatoria' })} />
          {errors.startDate && <span className="field-error">{errors.startDate.message}</span>}
        </label>

        <label>
          Dias
          <select {...register('days', { required: 'Quantidade de dias e obrigatoria' })}>
            {daysOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          ID do saldo de ferias
          <input type="number" {...register('vacationBalanceId', { required: 'ID do saldo e obrigatorio' })} />
          {errors.vacationBalanceId && <span className="field-error">{errors.vacationBalanceId.message}</span>}
        </label>

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Programando...' : 'Programar Ferias'}
        </button>
      </form>
    </section>
  );
};

export default VacationPage;
