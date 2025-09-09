import { User } from '@/types';

// Demo user accounts
export const DEMO_USERS: Record<string, { user: User; password: string }> = {
  admin: {
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@toray.com',
      role: 'production_manager',
      department: 'Production',
      permissions: ['read', 'write', 'admin'],
    },
    password: 'admin123'
  },
  operator1: {
    user: {
      id: '2',
      username: 'operator1',
      email: 'operator1@toray.com',
      role: 'operator',
      department: 'Production',
      permissions: ['read'],
    },
    password: 'demo'
  },
  quality_mgr: {
    user: {
      id: '3',
      username: 'quality_mgr',
      email: 'quality@toray.com',
      role: 'quality_manager',
      department: 'Quality Control',
      permissions: ['read', 'write'],
    },
    password: 'demo'
  },
  executive: {
    user: {
      id: '4',
      username: 'executive',
      email: 'executive@toray.com',
      role: 'executive',
      department: 'Management',
      permissions: ['read'],
    },
    password: 'demo'
  }
};

// Demo authentication
export const authenticateDemo = (username: string, password: string): { token: string; user: User } | null => {
  const demoAccount = DEMO_USERS[username];
  
  if (demoAccount && demoAccount.password === password) {
    return {
      token: `demo-token-${username}-${Date.now()}`,
      user: demoAccount.user
    };
  }
  
  return null;
};

// Check if we're in demo mode (no API URL configured)
export const isDemoMode = (): boolean => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('isDemoMode check - VITE_API_URL:', apiUrl);
  console.log('isDemoMode check - typeof:', typeof apiUrl);
  console.log('isDemoMode check - length:', apiUrl?.length);
  
  // More robust demo mode detection
  const isDemo = !apiUrl || 
                apiUrl.trim() === '' || 
                apiUrl === 'undefined' || 
                apiUrl === 'null' ||
                apiUrl === '""' ||
                apiUrl === "''" ||
                apiUrl.includes('localhost') === false && apiUrl.includes('http') === false;
                
  console.log('isDemoMode result:', isDemo);
  return isDemo;
};