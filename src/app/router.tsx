import { Navigate, createBrowserRouter } from 'react-router-dom';
import { GuestOnly, RequireAuth } from '@/app/auth';
import { AppLayout } from '@/layouts/AppLayout';
import { AcceptInvitePage } from '@/pages/AcceptInvitePage';
import { CropsPage } from '@/pages/CropsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { FieldsPage } from '@/pages/FieldsPage';
import { HomePage } from '@/pages/HomePage';
import { MaterialsPage } from '@/pages/MaterialsPage';
import { LoginPage } from '@/pages/LoginPage';
import { PlanResultPage } from '@/pages/PlanResultPage';
import { PlansPage } from '@/pages/PlansPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { RegisterPage } from '@/pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestOnly>
        <RegisterPage />
      </GuestOnly>
    ),
  },
  {
    path: '/invite/:token',
    element: <AcceptInvitePage />,
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'plans/:planId/results',
        element: <PlanResultPage />,
      },
      {
        path: 'fields',
        element: <FieldsPage />,
      },
      {
        path: 'crops',
        element: <CropsPage />,
      },
      {
        path: 'materials',
        element: <MaterialsPage />,
      },
      {
        path: 'employees',
        element: <EmployeesPage />,
      },
      {
        path: 'settings',
        element: (
          <PlaceholderPage
            title="Settings"
            text="Настройки организации и профиля будут добавлены отдельным экраном."
          />
        ),
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
],
{
    basename: '/ucrop-interface',
});
