import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Switch, Checkbox, Radio } from 'antd';
import { generateAriaLabel, formAccessibility, announceToScreenReader } from '../../utils/accessibility';

const { Option } = Select;
const { TextArea } = Input;

// Accessible Input Component
export const AccessibleInput = ({
  label,
  error,
  required = false,
  helpText,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(' ');

  return (
    <div className="accessible-input-wrapper">
      <label 
        htmlFor={inputId}
        className={`accessible-label ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span aria-label="required" className="required-indicator">*</span>}
      </label>
      
      <Input
        id={inputId}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      />
      
      {helpText && (
        <div id={helpId} className="help-text" role="note">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

// Accessible Select Component
export const AccessibleSelect = ({
  label,
  options = [],
  error,
  required = false,
  helpText,
  id,
  placeholder,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helpId = helpText ? `${selectId}-help` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(' ');

  return (
    <div className="accessible-select-wrapper">
      <label 
        htmlFor={selectId}
        className={`accessible-label ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span aria-label="required" className="required-indicator">*</span>}
      </label>
      
      <Select
        id={selectId}
        placeholder={placeholder || `Chọn ${label.toLowerCase()}`}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      >
        {options.map(option => (
          <Option 
            key={option.value} 
            value={option.value}
            aria-label={option.label}
          >
            {option.label}
          </Option>
        ))}
      </Select>
      
      {helpText && (
        <div id={helpId} className="help-text" role="note">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

// Accessible Button Component
export const AccessibleButton = ({
  children,
  loading = false,
  disabled = false,
  type = 'default',
  size = 'middle',
  ariaLabel,
  onClick,
  ...props
}) => {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      
      // Announce action to screen readers
      if (type === 'primary') {
        announceToScreenReader('Hành động đã được thực hiện', 'polite');
      }
    }
  };

  return (
    <Button
      type={type}
      size={size}
      loading={loading}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
      onClick={handleClick}
      className={`accessible-button ${size === 'large' ? 'touch-target' : ''}`}
      {...props}
    >
      {children}
    </Button>
  );
};

// Accessible Form Component
export const AccessibleForm = ({
  children,
  onSubmit,
  onError,
  title,
  description,
  ...props
}) => {
  const [form] = Form.useForm();
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const handleSubmit = async (values) => {
    try {
      setErrors({});
      await onSubmit(values);
      announceToScreenReader('Form đã được gửi thành công', 'polite');
    } catch (error) {
      const formErrors = error.errors || {};
      setErrors(formErrors);
      
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.focus();
          announceToScreenReader(`Có lỗi trong trường ${firstErrorField}`, 'assertive');
        }
      }
      
      if (onError) {
        onError(error);
      }
    }
  };

  const handleSubmitFailed = (errorInfo) => {
    announceToScreenReader('Có lỗi trong form, vui lòng kiểm tra lại', 'assertive');
    
    // Focus on first error field
    const firstError = errorInfo.errorFields[0];
    if (firstError) {
      const fieldName = firstError.name[0];
      const errorElement = document.getElementById(fieldName);
      if (errorElement) {
        errorElement.focus();
      }
    }
  };

  return (
    <div className="accessible-form-wrapper">
      {title && (
        <h2 id="form-title" className="form-title">
          {title}
        </h2>
      )}
      
      {description && (
        <p id="form-description" className="form-description">
          {description}
        </p>
      )}
      
      <Form
        ref={formRef}
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFailed}
        aria-labelledby={title ? 'form-title' : undefined}
        aria-describedby={description ? 'form-description' : undefined}
        {...props}
      >
        {children}
      </Form>
    </div>
  );
};

// Accessible Search Component
export const AccessibleSearch = ({
  placeholder = 'Tìm kiếm...',
  onSearch,
  loading = false,
  value,
  onChange,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState(value || '');
  const searchId = `search-${Math.random().toString(36).substr(2, 9)}`;

  const handleSearch = (searchText) => {
    if (onSearch) {
      onSearch(searchText);
      announceToScreenReader(
        searchText ? `Đang tìm kiếm: ${searchText}` : 'Đã xóa tìm kiếm',
        'polite'
      );
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue);
    }
  };

  return (
    <div className="accessible-search-wrapper" role="search">
      <label htmlFor={searchId} className="sr-only">
        Tìm kiếm
      </label>
      
      <Input.Search
        id={searchId}
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
        loading={loading}
        aria-label="Tìm kiếm"
        aria-describedby={`${searchId}-instructions`}
        {...props}
      />
      
      <div id={`${searchId}-instructions`} className="sr-only">
        Nhập từ khóa và nhấn Enter hoặc click nút tìm kiếm
      </div>
    </div>
  );
};

// Accessible Modal Component
export const AccessibleModal = ({
  title,
  children,
  visible,
  onCancel,
  onOk,
  okText = 'OK',
  cancelText = 'Hủy',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (visible) {
      // Save current focus
      previousFocus.current = document.activeElement;
      
      // Announce modal opening
      announceToScreenReader(`Đã mở hộp thoại: ${title}`, 'assertive');
    } else if (previousFocus.current) {
      // Restore focus when modal closes
      previousFocus.current.focus();
    }
  }, [visible, title]);

  const handleCancel = () => {
    announceToScreenReader('Đã đóng hộp thoại', 'polite');
    if (onCancel) {
      onCancel();
    }
  };

  const handleOk = () => {
    if (onOk) {
      onOk();
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={okText}
      cancelText={cancelText}
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
      role="dialog"
      aria-modal="true"
      {...props}
    >
      <div id="modal-content">
        {children}
      </div>
    </Modal>
  );
};

export default {
  AccessibleInput,
  AccessibleSelect,
  AccessibleButton,
  AccessibleForm,
  AccessibleSearch,
  AccessibleModal
};
