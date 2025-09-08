import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/redux';
import { authActions, uiActions } from '@/store';
import { authAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const { Title, Text, Paragraph } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(values.username, values.password);
      
      dispatch(authActions.loginSuccess({
        user: response.user,
        token: response.token,
      }));

      dispatch(uiActions.addNotification({
        type: 'success',
        message: `Welcome back, ${response.user.username}!`,
        duration: 3000,
      }));

      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'operator1', role: 'Operator', description: 'Process control and monitoring' },
    { username: 'quality_mgr', role: 'Quality Manager', description: 'Quality control and reports' },
    { username: 'prod_mgr', role: 'Production Manager', description: 'Production oversight and analytics' },
    { username: 'env_officer', role: 'Environmental Officer', description: 'Environmental monitoring and compliance' },
    { username: 'executive', role: 'Executive', description: 'Strategic dashboard and reports' },
  ];

  const handleDemoLogin = (username: string) => {
    form.setFieldsValue({ username, password: 'demo' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(45deg, #1890ff, #52c41a)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <SettingOutlined style={{ fontSize: '32px', color: 'white' }} />
          </div>
          
          <Title level={2} style={{ margin: 0, color: '#1f1f1f' }}>
            Toray Monitoring System
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Manufacturing Process Control & Analytics
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            closable
            style={{ marginBottom: '24px' }}
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
          disabled={loading}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              {
                required: true,
                message: 'Please enter your username',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please enter your password',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Button 
            type="link" 
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            style={{ padding: 0 }}
          >
            {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
          </Button>
        </Divider>

        {showDemoAccounts && (
          <div>
            <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: '16px' }}>
              Click on any account to auto-fill credentials (password: "demo")
            </Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {demoAccounts.map((account) => (
                <Button
                  key={account.username}
                  type="text"
                  onClick={() => handleDemoLogin(account.username)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    height: 'auto',
                    padding: '8px 12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '4px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{account.role}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      @{account.username} - {account.description}
                    </div>
                  </div>
                </Button>
              ))}
            </Space>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Toray Composite Materials © 2024
            <br />
            Advanced Manufacturing Monitoring System
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;