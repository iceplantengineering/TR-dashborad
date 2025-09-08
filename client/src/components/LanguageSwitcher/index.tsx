import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language;

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const languageOptions: MenuProps['items'] = [
    {
      key: 'ja',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇯🇵</span>
          <span>日本語</span>
        </div>
      ),
      onClick: () => handleLanguageChange('ja'),
    },
    {
      key: 'en',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇺🇸</span>
          <span>English</span>
        </div>
      ),
      onClick: () => handleLanguageChange('en'),
    },
  ];

  const getCurrentLanguageLabel = () => {
    switch (currentLanguage) {
      case 'ja':
        return (
          <Space>
            <span>🇯🇵</span>
            <span>日本語</span>
          </Space>
        );
      case 'en':
        return (
          <Space>
            <span>🇺🇸</span>
            <span>English</span>
          </Space>
        );
      default:
        return (
          <Space>
            <GlobalOutlined />
            <span>{t('common.language')}</span>
          </Space>
        );
    }
  };

  return (
    <Dropdown
      menu={{ items: languageOptions }}
      placement="bottomRight"
      arrow
    >
      <Button
        type="text"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'inherit',
        }}
      >
        {getCurrentLanguageLabel()}
        <DownOutlined style={{ fontSize: '10px' }} />
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;