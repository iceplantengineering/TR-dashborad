import React, { useState } from 'react';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Switch,
  Space,
  Typography,
} from 'antd';
import {
  DashboardOutlined,
  ExperimentOutlined,
  ToolOutlined,
  SafetyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import {
  selectAuth,
  selectUI,
  selectWebSocket,
  selectUnacknowledgedAlerts,
  authActions,
  uiActions,
} from '@/store';
import { authAPI } from '@/services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  
  const { user } = useAppSelector(selectAuth);
  const { sidebarCollapsed, theme } = useAppSelector(selectUI);
  const { connected } = useAppSelector(selectWebSocket);
  const unacknowledgedAlerts = useAppSelector(selectUnacknowledgedAlerts);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(authActions.logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(authActions.logout());
      navigate('/login');
    }
  };

  const toggleTheme = (checked: boolean) => {
    dispatch(uiActions.setTheme(checked ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    dispatch(uiActions.setSidebarCollapsed(!sidebarCollapsed));
  };

  const userMenuItems: any[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: handleLogout,
    },
  ];

  // Define menu items based on user role
  const getMenuItems = () => {
    const allItems = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: t('common.dashboard'),
      },
      {
        key: '/process-monitoring',
        icon: <ExperimentOutlined />,
        label: t('common.processMonitoring'),
      },
      {
        key: '/equipment',
        icon: <ToolOutlined />,
        label: t('common.equipment'),
      },
      {
        key: '/quality',
        icon: <SafetyOutlined />,
        label: t('common.quality'),
      },
      {
        key: '/environmental',
        icon: <GlobalOutlined />,
        label: t('common.environmental'),
      },
      {
        key: '/traceability',
        icon: <HistoryOutlined />,
        label: t('common.traceability'),
      },
      {
        key: '/reports',
        icon: <FileTextOutlined />,
        label: t('common.reports'),
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: t('common.settings'),
      },
    ];

    // Filter items based on user permissions
    if (!user?.permissions) return allItems;

    return allItems.filter(item => {
      switch (item.key) {
        case '/process-monitoring':
          return user.permissions.includes('view_process');
        case '/quality':
          return user.permissions.includes('quality_input') || user.permissions.includes('quality_reports');
        case '/environmental':
          return user.permissions.includes('view_environmental') || user.permissions.includes('environmental_reports');
        case '/reports':
          return user.permissions.includes('view_reports') || user.permissions.includes('view_analytics');
        default:
          return true;
      }
    });
  };

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        theme={theme}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            padding: sidebarCollapsed ? 0 : '0 24px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {!sidebarCollapsed && (
            <div>
              <Text strong style={{ color: theme === 'dark' ? 'white' : '#1890ff' }}>
                Toray Monitoring
              </Text>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                Manufacturing System
              </div>
            </div>
          )}
        </div>
        
        <Menu
          theme={theme}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <AntLayout style={{ marginLeft: sidebarCollapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 16px',
            background: theme === 'dark' ? '#001529' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            
            <Space>
              <Badge
                status={connected ? 'success' : 'error'}
                text={connected ? 'Connected' : 'Disconnected'}
              />
            </Space>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Space size="middle">
              <Badge count={unacknowledgedAlerts.length} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => navigate('/alerts')}
                />
              </Badge>

              <LanguageSwitcher />

              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />

              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button type="text" style={{ height: 'auto', padding: '8px 12px' }}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {user && (
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                          {user.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    )}
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content
          style={{
            margin: '16px',
            padding: '24px',
            background: theme === 'dark' ? '#1f1f1f' : '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;