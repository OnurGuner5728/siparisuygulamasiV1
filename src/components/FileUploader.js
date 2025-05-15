'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * FileUploader Komponenti
 * 
 * @param {Object} props
 * @param {string} props.defaultImage - Varsayılan resim URL
 * @param {function} props.onImageUpload - Resim yükleme callback fonksiyonu
 * @param {string} props.label - Input etiketi
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input adı
 * @param {boolean} props.required - Zorunlu alan mı?
 * @param {string} props.error - Hata mesajı
 * @param {string} props.accept - Kabul edilen dosya tipleri (örn: "image/*")
 * @param {number} props.maxSizeInMB - Maksimum dosya boyutu (MB)
 * @param {boolean} props.showCropper - Kırpma aracı gösterilsin mi?
 * @param {Object} props.cropperOptions - Kırpma aracı ayarları
 * @param {string} props.placeholderImage - Resim bulunmadığında gösterilecek resim
 * @returns {JSX.Element}
 */
export default function FileUploader({
  defaultImage = '',
  onImageUpload,
  label = 'Resim Yükle',
  id = 'fileUpload',
  name = 'fileUpload',
  required = false,
  error = '',
  accept = 'image/*',
  maxSizeInMB = 2,
  showCropper = false,
  cropperOptions = { aspectRatio: 1 },
  placeholderImage = '/placeholder-image.jpg',
}) {
  // State tanımlamaları
  const [previewUrl, setPreviewUrl] = useState(defaultImage || placeholderImage);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Component yüklendiğinde varsayılan resmi ayarla
  useEffect(() => {
    if (defaultImage) {
      setPreviewUrl(defaultImage);
    }
  }, [defaultImage]);

  // Dosya değiştirildiğinde
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleSelectedFile(selectedFile);
  };

  // Sürükle bırak işlemleri
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      handleSelectedFile(selectedFile);
    }
  };

  // Seçilen dosyayı işle
  const handleSelectedFile = (selectedFile) => {
    setFileError('');
    
    // Dosya tipi kontrolü
    if (!selectedFile.type.match(accept.replace('*', '.*'))) {
      setFileError(`Sadece ${accept} dosya tipleri kabul edilmektedir.`);
      return;
    }
    
    // Dosya boyutu kontrolü
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (selectedFile.size > maxSizeInBytes) {
      setFileError(`Dosya boyutu ${maxSizeInMB}MB'dan küçük olmalıdır.`);
      return;
    }
    
    setFile(selectedFile);
    
    // Önizleme URL'si oluştur
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    
    // Kırpma işlemi yapılacaksa
    if (showCropper) {
      setIsCropping(true);
    } else {
      // Kırpma yapılmayacaksa direkt callback'i çağır
      if (onImageUpload) onImageUpload(selectedFile);
    }
    
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Kırpma işlemi tamamlandığında
  const handleCropComplete = (croppedImageBlob) => {
    setCroppedImage(croppedImageBlob);
    setIsCropping(false);
    
    if (onImageUpload) onImageUpload(croppedImageBlob);
  };

  // Resmi kaldır
  const handleRemoveImage = () => {
    setPreviewUrl(placeholderImage);
    setFile(null);
    setCroppedImage(null);
    
    // Input değerini sıfırla
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onImageUpload) onImageUpload(null);
  };

  // Dosya seçme dialogunu aç
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Kırpma aracını kapat (iptal)
  const handleCancelCrop = () => {
    setIsCropping(false);
  };

  // Şu an kırpma aracı tam implementasyonu yok, gerçek projede eklenecektir
  // Bu fonksiyonu projenizde bir kırpma kütüphanesi ile değiştirmeniz gerekecek
  
  // Görsel kütüphane için örnek kırpma aracı (gerçek projede ReactCrop, react-image-crop, vb. kullanılabilir)
  const CropperTool = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
        <h3 className="text-lg font-medium mb-4">Resmi Kırp</h3>
        <div className="border border-gray-300 p-4 mb-4 rounded">
          {/* Burada kırpma aracı kullanılacak */}
          <img src={previewUrl} alt="Kırpılacak resim" className="max-h-64 mx-auto" />
          <p className="text-gray-500 text-center mt-2">Not: Gerçek uygulamada bu alanda resim kırpma aracı olacaktır.</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handleCancelCrop}
          >
            İptal
          </button>
          <button 
            type="button" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => handleCropComplete(file)}
          >
            Kırp ve Uygula
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${error || fileError ? 'border-red-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleOpenFileDialog}
      >
        <input
          type="file"
          id={id}
          name={name}
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          required={required}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center">
          {previewUrl ? (
            <div className="relative mb-2">
              <img
                src={previewUrl}
                alt="Önizleme"
                className="max-h-48 max-w-full object-contain"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                &times;
              </button>
            </div>
          ) : (
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
          
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Resmi sürükleyip bırakın veya {' '}
              <span className="text-blue-600 hover:underline">taramak için tıklayın</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF dosyaları, maksimum {maxSizeInMB}MB
            </p>
          </div>
        </div>
      </div>
      
      {(error || fileError) && (
        <p className="mt-1 text-sm text-red-600">{error || fileError}</p>
      )}
      
      {isCropping && showCropper && <CropperTool />}
    </div>
  );
} 