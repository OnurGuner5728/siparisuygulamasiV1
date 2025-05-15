'use client';

import React, { memo } from 'react';

const CartItem = ({ item, onRemove, onAdd, onRemoveCompletely }) => {
  return (
    <div className="py-3 flex justify-between items-center">
      <div>
        <div className="flex items-center">
          <span className="font-medium">{item.name}</span>
          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{item.quantity}x</span>
        </div>
        <p className="text-sm text-gray-600">{(item.price * item.quantity).toFixed(2)} TL</p>
        {item.storeName && (
          <p className="text-xs text-gray-400">{item.storeName}</p>
        )}
      </div>
      <div className="flex items-center">
        <button 
          className="text-red-500 hover:text-red-700 p-1"
          onClick={() => onRemove(item.id)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button 
          className="text-blue-500 hover:text-blue-700 p-1"
          onClick={() => onAdd(item)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button 
          className="ml-1 text-gray-400 hover:text-gray-600 p-1"
          onClick={() => onRemoveCompletely(item.id)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Gereksiz render'ları önlemek için memo kullanıyoruz
export default memo(CartItem); 