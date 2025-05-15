'use client';

import React, { useState } from 'react';

/**
 * Checkbox Bileşeni
 * @param {Object} props - Checkbox özellikleri
 * @param {string} props.id - Checkbox ID'si
 * @param {string} props.name - Checkbox adı
 * @param {string} props.label - Checkbox etiketi
 * @param {boolean} [props.checked=false] - Checkbox seçili mi
 * @param {boolean} [props.disabled=false] - Checkbox devre dışı mı
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {function} [props.onChange] - Değişiklik olduğunda çağrılacak işlev
 */
const Checkbox = ({
  id,
  name,
  label,
  checked = false,
  disabled = false,
  className = '',
  onChange,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  
  const handleChange = (e) => {
    if (!disabled) {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      
      if (onChange) {
        onChange(e);
      }
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only" // Orijinal checkbox'ı gizle
          {...props}
        />
        <div 
          className={`
            w-5 h-5 flex items-center justify-center border rounded transition-all
            ${isChecked 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 border-transparent' 
              : 'bg-white border-gray-300'}
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'}
            ${isChecked && !disabled ? 'scale-110' : ''}
          `}
        >
          {isChecked && (
            <svg 
              className="w-3.5 h-3.5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7"
              />
            </svg>
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

export default Checkbox; 