import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/middleware/auth';
import { User } from '@/types';
import logger from '@/utils/logger';

const router = express.Router();

// Mock users database (in production, this would be in a real database)
const mockUsers: User[] = [
  {
    id: '1',
    username: 'operator1',
    email: 'operator@toray.com',
    role: 'operator',
    department: 'Production',
    permissions: ['view_process', 'control_process', 'quality_input']
  },
  {
    id: '2',
    username: 'quality_mgr',
    email: 'quality@toray.com',
    role: 'quality_manager',
    department: 'Quality',
    permissions: ['view_process', 'quality_input', 'quality_reports', 'view_analytics']
  },
  {
    id: '3',
    username: 'prod_mgr',
    email: 'production@toray.com',
    role: 'production_manager',
    department: 'Production',
    permissions: ['view_process', 'control_process', 'view_analytics', 'manage_schedules', 'view_reports']
  },
  {
    id: '4',
    username: 'env_officer',
    email: 'environment@toray.com',
    role: 'environmental_officer',
    department: 'Environment',
    permissions: ['view_environmental', 'environmental_reports', 'compliance_reports']
  },
  {
    id: '5',
    username: 'executive',
    email: 'exec@toray.com',
    role: 'executive',
    department: 'Management',
    permissions: ['view_all', 'executive_dashboard', 'strategic_reports']
  }
];

// Hash password for demo users (in production, this would be done during user creation)
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user (in production, query from database)
    const user = mockUsers.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept any password
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    const isValidPassword = true;

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    logger.info(`User ${username} logged in successfully`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint (for demo purposes)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, department } = req.body;

    if (!username || !email || !password || !role || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Define permissions based on role
    const rolePermissions = {
      operator: ['view_process', 'control_process', 'quality_input'],
      quality_manager: ['view_process', 'quality_input', 'quality_reports', 'view_analytics'],
      production_manager: ['view_process', 'control_process', 'view_analytics', 'manage_schedules', 'view_reports'],
      environmental_officer: ['view_environmental', 'environmental_reports', 'compliance_reports'],
      executive: ['view_all', 'executive_dashboard', 'strategic_reports']
    };

    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      role: role as User['role'],
      department,
      permissions: rolePermissions[role as keyof typeof rolePermissions] || []
    };

    mockUsers.push(newUser);

    const token = generateToken(newUser);

    logger.info(`New user registered: ${username} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        permissions: newUser.permissions
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user profile
router.get('/profile', (req: Request, res: Response) => {
  // This would typically use the authenticateToken middleware
  // For demo purposes, return a default user
  const demoUser = mockUsers[0];
  
  res.json({
    success: true,
    user: {
      id: demoUser.id,
      username: demoUser.username,
      email: demoUser.email,
      role: demoUser.role,
      department: demoUser.department,
      permissions: demoUser.permissions
    }
  });
});

// Get all users (admin only)
router.get('/users', (req: Request, res: Response) => {
  // In production, this would check admin permissions
  const users = mockUsers.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    department: user.department,
    permissions: user.permissions
  }));

  res.json({
    success: true,
    users
  });
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  // In a stateful system, this might invalidate the token
  // For JWT tokens, logout is typically handled client-side
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token endpoint
router.post('/refresh', (req: Request, res: Response) => {
  // In production, this would validate the refresh token and issue a new access token
  const demoUser = mockUsers[0];
  const newToken = generateToken(demoUser);
  
  res.json({
    success: true,
    token: newToken
  });
});

export default router;