'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * Select Bileşeni
 * @param {Object} props - Select özellikleri
 * @param {string} props.id - Select ID'si
 * @param {string} props.name - Select adı
 * @param {string} props.label - Select etiketi
 * @param {string} [props.placeholder="Seçiniz"] - Placeholder metni
 * @param {boolean} [props.required=false] - Zorunlu alan
 * @param {string} [props.value] - Seçilen değer
 * @param {string} [props.error] - Hata mesajı
 * @param {string} [props.helperText] - Yardımcı metin
 * @param {Array} props.options - Seçenekler dizisi [{value, label}]
 * @param {string} [props.className] - Ek CSS sınıfları
 * @param {boolean} [props.fullWidth=true] - Tam genişlikte select
 * @param {function} [props.onChange] - Değer değişikliği işlevi
 * @param {boolean} [props.disabled=false] - Devre dışı durumu
 */
const Select = ({
  id,
  name,
  label,
  placeholder = "Seçiniz",
  required = false,
  value,
  error,
  helperText,
  options = [],
  className = '',
  fullWidth = true,
  onChange,
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const selectRef = useRef(null);
  
  // Seçilen değere göre etiketi güncelle
  useEffect(() => {
    const selected = options.find(option => option.value === selectedValue);
    setSelectedLabel(selected ? selected.label : placeholder);
  }, [selectedValue, options, placeholder]);
  
  // Dışarıdan gelen değeri takip et
  useEffect(() => {
    if (value !== undefined && value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value]);
  
  // Dışarı tıklamayı algıla ve menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Select aç/kapat
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Seçenek seçme işlevi
  const handleSelect = (option) => {
    setSelectedValue(option.value);
    setIsOpen(false);
    
    if (onChange) {
      const fakeEvent = {
        target: {
          name,
          value: option.value
        }
      };
      onChange(fakeEvent);
    }
  };
  
  // Stil sınıfları
  const baseClasses = 'bg-gray-100 text-gray-800 px-4 py-3 rounded-xl border focus:outline-none transition-all duration-200';
  const errorClasses = error ? 'border-2 border-red-500' : 'border-transparent focus:border-orange-500';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4 ${className}`} ref={selectRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          className={`${baseClasses} ${errorClasses} ${disabledClasses} ${widthClass} flex items-center justify-between`}
          onClick={toggleDropdown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          <span className={`block truncate ${!selectedValue ? 'text-gray-500' : ''}`}>
            {selectedLabel}
          </span>
          <span className="pointer-events-none">
            <svg 
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </div>
        
        {/* Dropdown menü */}
        {isOpen && (
          <div 
            className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg max-h-60 overflow-auto border border-gray-200"
            role="listbox"
            aria-labelledby={label ? `${id}-label` : undefined}
          >
            <ul className="py-1">
              {options.map((option) => (
                <li 
                  key={option.value}
                  className={`
                    px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150
                    ${option.value === selectedValue ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-800'}
                  `}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === selectedValue}
                >
                  {option.label}
                </li>
              ))}
              {options.length === 0 && (
                <li className="px-4 py-2 text-gray-500 italic">
                  Seçenek bulunmamaktadır
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select; 