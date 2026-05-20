const LoadingSpinner = ({ label = 'Carregando...' }) => (
  <div className="loading" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    {label}
  </div>
);

export default LoadingSpinner;
