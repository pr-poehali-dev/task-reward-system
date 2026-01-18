import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { api, type AuthResponse } from '@/lib/api';

interface AuthProps {
  onAuthSuccess: (data: AuthResponse) => void;
}

export const Auth = ({ onAuthSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }

    if (!isLogin && !username) {
      toast.error('Введите имя пользователя');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        toast.success('Вход выполнен!');
        onAuthSuccess(data);
      } else {
        const data = await api.register(email, password, username);
        toast.success('Регистрация успешна!');
        onAuthSuccess(data);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Icon name="CheckCircle" size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Задачник Pro</h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium mb-2 block">Имя пользователя</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ваше имя"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              isLogin ? 'Войти' : 'Зарегистрироваться'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
