import React from 'react';
import { Select, Space, Typography } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, getCurrentLanguage } from '../../i18n';

const { Text } = Typography;
const { Option } = Select;

const LanguageSwitcher = ({ 
  size = 'default', 
  showText = true, 
  placement = 'bottomRight',
  style = {} 
}) => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    // Optionally reload the page to ensure all components update
    // window.location.reload();
  };

  const getCurrentLanguageInfo = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const currentLangInfo = getCurrentLanguageInfo();

  return (
    <Space style={style}>
      {showText && (
        <Text type="secondary">
          <GlobalOutlined /> {t('settings.language')}:
        </Text>
      )}
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        size={size}
        style={{ minWidth: 120 }}
        placement={placement}
        dropdownMatchSelectWidth={false}
      >
        {languages.map(language => (
          <Option key={language.code} value={language.code}>
            <Space>
              <span style={{ fontSize: '16px' }}>{language.flag}</span>
              <span>{language.name}</span>
            </Space>
          </Option>
        ))}
      </Select>
    </Space>
  );
};

// Compact version for header/toolbar
export const CompactLanguageSwitcher = ({ style = {} }) => {
  const currentLanguage = getCurrentLanguage();
  const currentLangInfo = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
  };

  return (
    <Select
      value={currentLanguage}
      onChange={handleLanguageChange}
      size="small"
      style={{ minWidth: 80, ...style }}
      bordered={false}
      dropdownMatchSelectWidth={false}
    >
      {languages.map(language => (
        <Option key={language.code} value={language.code}>
          <Space size={4}>
            <span style={{ fontSize: '14px' }}>{language.flag}</span>
            <span style={{ fontSize: '12px' }}>{language.code.toUpperCase()}</span>
          </Space>
        </Option>
      ))}
    </Select>
  );
};

// Language selector for settings page
export const LanguageSelector = ({ value, onChange, style = {} }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      style={{ width: '100%', ...style }}
      placeholder="Select language"
    >
      {languages.map(language => (
        <Option key={language.code} value={language.code}>
          <Space>
            <span style={{ fontSize: '18px' }}>{language.flag}</span>
            <div>
              <div>{language.name}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {language.code.toUpperCase()}
              </Text>
            </div>
          </Space>
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher;
