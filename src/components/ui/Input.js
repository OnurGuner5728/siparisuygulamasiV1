'use client';

import React, { useState } from 'react';

/**
 * Tekrar kullanılabilir Input bileşeni
 * @param {Object} props - Input özellikleri
 * @param {string} props.name - Input adı
 * @param {string} props.type - Input tipi (text, email, password, vb.)
 * @param {string} props.label - Input etiketi
 * @param {string} [props.placeholder] - Placeholder metni
 * @param {boolean} [props.required=false] - Zorunlu alan
 * @param {string} [props.value] - Input değeri
 * @param {string} [props.error] - Hata mesajı
 * @param {string} [props.helperText] - Yardımcı metin
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {boolean} [props.fullWidth=true] - Tam genişlikte input
 * @param {function} [props.onChange] - Değer değişikliği işlevi
 * @param {function} [props.onFocus] - Odaklanma işlevi
 * @param {function} [props.onBlur] - Odak kaybetme işlevi
 * @param {React.ReactNode} [props.startIcon] - Başlangıç ikonu
 * @param {React.ReactNode} [props.endIcon] - Bitiş ikonu
 * @param {boolean} [props.disabled=false] - Devre dışı durumu
 */
const Input = ({
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  value,
  error,
  helperText,
  className = '',
  fullWidth = true,
  onChange,
  onFocus,
  onBlur,
  startIcon,
  endIcon,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // CSS sınıfları
  const baseClasses = 'px-4 py-3 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 transition-all duration-200 rounded-xl';
  const errorClasses = error ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-transparent focus:ring-orange-500';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  const focusedClasses = isFocused ? 'shadow-sm bg-white' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const iconClass = startIcon || endIcon ? 'pl-10' : '';
  
  // Input sınıflarını birleştir
  const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${focusedClasses} ${widthClass} ${iconClass} ${className}`;
  
  // Odaklanma işlevi
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  
  // Odak kaybetme işlevi
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  // Şifre gösterme/gizleme işlevi
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Şifre gösterme/gizleme ikonu
  const passwordIcon = type === 'password' && (
    <button
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
      onClick={togglePasswordVisibility}
      tabIndex="-1"
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {startIcon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />
        {endIcon && !passwordIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {endIcon}
          </div>
        )}
        {passwordIcon}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 