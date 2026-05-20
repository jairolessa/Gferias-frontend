import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import DepartmentFormPage from './pages/DepartmentFormPage';
import DepartmentsPage from './pages/DepartmentsPage';
import LoginPage from './pages/LoginPage';
import UserFormPage from './pages/UserFormPage';
import UsersPage from './pages/UsersPage';
import VacationBalancePage from './pages/VacationBalancePage';
import VacationPage from './pages/VacationPage';

const PrivateLayout = () => (
  <>
    <Navbar />
    <main className="page-shell">
      <Outlet />
    </main>
  </>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/users" replace /> : <LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/:id/edit" element={<UserFormPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/new" element={<DepartmentFormPage />} />
          <Route path="/vacation-balance" element={<VacationBalancePage />} />
          <Route path="/vacation" element={<VacationPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/users' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
