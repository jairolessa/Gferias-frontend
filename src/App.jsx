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

const HomeRedirect = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/users' : '/vacation-balance'} replace />;
};

const App = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const defaultPath = isAdmin ? '/users' : '/vacation-balance';

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultPath} replace /> : <LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/vacation-balance" element={<VacationBalancePage />} />
          <Route path="/vacation" element={<VacationPage />} />
          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/departments/new" element={<DepartmentFormPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? defaultPath : '/login'} replace />} />
    </Routes>
  );
};

export default App;
