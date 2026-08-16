import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authRepository } from '@/features/auth/api/authRepository';
import type { Organization, PublicUser } from '@/features/auth/model/types';

type AuthContextValue = {
  user: PublicUser | null;
  organization: Organization | null;
  login: (email: string, password: string) => void;
  register: (input: { name: string; organizationName: string; email: string; password: string }) => void;
  acceptInvite: (token: string, password: string) => void;
  refreshUser: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitial(): { user: PublicUser | null; organization: Organization | null } {
  const session = authRepository.getSession();
  if (!session) return { user: null, organization: null };
  const user = authRepository.getUser(session.userId);
  const organization = user ? authRepository.getOrganization(user.organizationId) : null;
  if (!user || !organization) {
    authRepository.clearSession();
    return { user: null, organization: null };
  }
  return { user, organization };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readInitial);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      organization: state.organization,
      login: (email, password) => {
        const next = authRepository.login(email, password);
        setState(next);
      },
      register: (input) => {
        const next = authRepository.register(input);
        setState(next);
      },
      acceptInvite: (token, password) => {
        const next = authRepository.acceptInvite(token, password);
        setState(next);
      },
      refreshUser: () => {
        setState(readInitial());
      },
      logout: () => {
        authRepository.clearSession();
        setState({ user: null, organization: null });
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (user?.status === 'inactive') logout();
  }, [user, logout]);
  if (!user || user.status === 'inactive') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
