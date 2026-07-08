import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from '../components/layout/PrivateRoute';
import AdminRoute from '../components/layout/AdminRoute';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Budgets from '../pages/Budgets';
import Wallets from '../pages/Wallets';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Categories from '../pages/Categories';
import AdminUsers from '../pages/AdminUsers';
import LoginPage from '../features/auth/components/LoginPage';
import RegisterPage from '../features/auth/components/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          // ─── Regular user routes ────────────────────────────
          { index: true, element: <Dashboard /> },
          { path: 'transactions', element: <Transactions /> },
          { path: 'budgets', element: <Budgets /> },
          { path: 'wallets', element: <Wallets /> },
          { path: 'reports', element: <Reports /> },
          { path: 'categories', element: <Categories /> },
          { path: 'settings', element: <Settings /> },

          // ─── Admin-only routes ──────────────────────────────
          {
            path: 'admin',
            element: <AdminRoute />,
            children: [
              { path: 'users', element: <AdminUsers /> },
            ],
          },
        ],
      },
    ],
  },
]);
