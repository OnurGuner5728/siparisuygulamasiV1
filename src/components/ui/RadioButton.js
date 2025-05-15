'use client';

import React from 'react';

/**
 * Radio Button Bileşeni
 * @param {Object} props - Radio button özellikleri
 * @param {string} props.id - Radio button ID'si
 * @param {string} props.name - Radio button adı
 * @param {string} props.value - Radio button değeri
 * @param {string} props.label - Radio button etiketi
 * @param {boolean} [props.checked=false] - Radio button seçili mi
 * @param {boolean} [props.disabled=false] - Radio button devre dışı mı
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {function} [props.onChange] - Değişiklik olduğunda çağrılacak işlev
 */
const RadioButton = ({
  id,
  name,
  value,
  label,
  checked = false,
  disabled = false,
  className = '',
  onChange,
  ...props
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only" // Orijinal radio button'ı gizle
          {...props}
        />
        <div 
          className={`
            w-5 h-5 flex items-center justify-center rounded-full border transition-all
            ${checked 
              ? 'border-orange-500' 
              : 'border-gray-300'}
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'}
          `}
        >
          {checked && (
            <div 
              className={`
                w-3 h-3 rounded-full 
                ${disabled 
                  ? 'bg-gray-400' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500'}
              `}
            />
          )}
        </div>
      </div>
      
      {label && (
        <label 
          htmlFor={id} 
          className={`ml-2 text-sm ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default RadioButton; 