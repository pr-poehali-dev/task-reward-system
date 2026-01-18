const API_URLS = {
  auth: 'https://functions.poehali.dev/57a34669-bb88-4d44-9498-e2ead2b3ed02',
  data: 'https://functions.poehali.dev/13914d65-5796-4276-8e75-73845b5e2eb8',
};

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const api = {
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, username }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  async verify(token: string): Promise<{ user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'verify' }),
    });
    
    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    
    return response.json();
  },

  async syncData(token: string, data: any): Promise<void> {
    const response = await fetch(API_URLS.data, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sync failed');
    }
  },

  async getData(token: string): Promise<any> {
    const response = await fetch(API_URLS.data, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get data');
    }
    
    return response.json();
  },
};
