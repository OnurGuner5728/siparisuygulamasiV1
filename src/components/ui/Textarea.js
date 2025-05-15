'use client';

import React, { useState } from 'react';

/**
 * Textarea Bileşeni
 * @param {Object} props - Textarea özellikleri
 * @param {string} props.id - Textarea ID'si
 * @param {string} props.name - Textarea adı
 * @param {string} props.label - Textarea etiketi
 * @param {string} [props.placeholder] - Placeholder metni
 * @param {boolean} [props.required=false] - Zorunlu alan
 * @param {string} [props.value] - Textarea değeri
 * @param {string} [props.error] - Hata mesajı
 * @param {string} [props.helperText] - Yardımcı metin
 * @param {number} [props.rows=4] - Satır sayısı
 * @param {number} [props.maxLength] - Maksimum karakter sayısı
 * @param {boolean} [props.showCharCount=false] - Karakter sayısını göstersin mi
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {boolean} [props.fullWidth=true] - Tam genişlikte textarea
 * @param {function} [props.onChange] - Değer değişikliği işlevi
 * @param {function} [props.onFocus] - Odaklanma işlevi
 * @param {function} [props.onBlur] - Odak kaybetme işlevi
 * @param {boolean} [props.disabled=false] - Devre dışı durumu
 * @param {boolean} [props.autoResize=false] - Otomatik yükseklik artışı
 */
const Textarea = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  value,
  error,
  helperText,
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
  fullWidth = true,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  autoResize = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  
  // CSS sınıfları
  const baseClasses = 'px-4 py-3 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 transition-all duration-200 rounded-xl resize-none';
  const errorClasses = error ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-transparent focus:ring-orange-500';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  const focusedClasses = isFocused ? 'shadow-sm bg-white' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Textarea sınıflarını birleştir
  const textareaClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${focusedClasses} ${widthClass} ${className}`;
  
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
  
  // Değer değişikliği işlevi
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Maksimum karakter sayısı kontrolü
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    setInputValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value !== undefined ? value : inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          style={autoResize ? { overflow: 'hidden' } : {}}
          onInput={autoResize ? (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
          } : undefined}
          {...props}
        />
      </div>
      
      {/* Hata mesajı veya yardımcı metin */}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {/* Alt kısım: Karakter sayacı veya yardımcı metin */}
      <div className="flex justify-between mt-1">
        {helperText && !error && (
          <p id={`${name}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
        
        {showCharCount && maxLength && (
          <p className={`text-xs ${(value || inputValue).length > maxLength * 0.8 ? 'text-orange-500' : 'text-gray-500'}`}>
            {(value !== undefined ? value : inputValue).length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default Textarea; 