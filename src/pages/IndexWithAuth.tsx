import { useState, useEffect } from 'react';
import Auth from '@/components/Auth';
import Index from '@/pages/Index';
import { api, type AuthResponse, type User } from '@/lib/api';
import { toast } from 'sonner';

const IndexWithAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('authToken');
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        console.log('[IndexWithAuth] Verifying token...');
        const data = await api.verify(savedToken);
        console.log('[IndexWithAuth] Token verified:', data.user);
        setUser(data.user);
        setToken(savedToken);
      } catch (error) {
        console.error('[IndexWithAuth] Token verification failed:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        toast.error('Сессия истекла. Войдите снова');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('authToken', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    toast.success('Вы вышли из аккаунта');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return <Index user={user} token={token} onLogout={handleLogout} />;
};

export default IndexWithAuth;