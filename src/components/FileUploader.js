'use client';
import React, { useState, useRef } from 'react';
import Button from '@/components/ui/Button';

/**
 * Dosya Yükleme Bileşeni
 * @param {Object} props - FileUploader özellikleri
 * @param {function} props.onUpload - Yükleme tamamlandığında çağrılacak fonksiyon
 * @param {Array} props.accept - Kabul edilen dosya uzantıları (örn: ['image/jpeg', 'image/png'])
 * @param {number} props.maxSize - Maksimum dosya boyutu (byte cinsinden)
 * @param {number} props.maxFiles - Maksimum yüklenebilecek dosya sayısı
 * @param {boolean} props.multiple - Çoklu dosya yükleme
 * @param {Array} props.value - Mevcut yüklenen dosyalar
 * @param {string} props.uploadText - Yükleme alanındaki metin
 * @param {string} props.className - Ek CSS sınıfları
 * @param {function} props.onError - Hata durumunda çağrılacak fonksiyon
 */
const FileUploader = ({
  onUpload,
  accept = ['image/jpeg', 'image/png', 'image/gif'],
  maxSize = 5 * 1024 * 1024, // 5MB varsayılan
  maxFiles = 5,
  multiple = false,
  value = [],
  uploadText = 'Dosya seçin veya sürükleyin',
  className = '',
  onError,
}) => {
  const [files, setFiles] = useState(value || []);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  
  const fileInputRef = useRef(null);
  
  // Dosya uzantılarını .jpg, .png formatına dönüştür
  const getAcceptString = () => {
    return accept.map(type => `.${type.split('/')[1]}`).join(',');
  };
  
  // Dosya seçildiğinde
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    validateAndUploadFiles(selectedFiles);
    
    // Input değerini sıfırla (aynı dosyayı tekrar seçmeye izin vermek için)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Dosya bırakıldığında
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    validateAndUploadFiles(droppedFiles);
  };
  
  // Sürükleme olayları
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  // Gönderme butonu tıklandığında
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Dosya silme
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Callback ile bildir
    if (onUpload) {
      onUpload(newFiles);
    }
  };
  
  // Dosya doğrulama ve yükleme
  const validateAndUploadFiles = (selectedFiles) => {
    // Tüm hataları temizle
    setErrors([]);
    
    // Dosya sayısı kontrolü
    if (multiple) {
      if (files.length + selectedFiles.length > maxFiles) {
        const error = `En fazla ${maxFiles} dosya yükleyebilirsiniz`;
        setErrors(prev => [...prev, error]);
        
        if (onError) {
          onError(error);
        }
        
        return;
      }
    } else if (selectedFiles.length > 1) {
      const error = `Sadece 1 dosya yükleyebilirsiniz`;
      setErrors(prev => [...prev, error]);
      
      if (onError) {
        onError(error);
      }
      
      return;
    }
    
    // Dosya türü ve boyut kontrolü
    const validFiles = selectedFiles.filter(file => {
      // Dosya türü kontrolü
      if (!accept.includes(file.type)) {
        const error = `"${file.name}" dosyası desteklenmeyen bir formatta`;
        setErrors(prev => [...prev, error]);
        
        if (onError) {
          onError(error);
        }
        
        return false;
      }
      
      // Dosya boyutu kontrolü
      if (file.size > maxSize) {
        const fileSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        const error = `"${file.name}" dosyası çok büyük. Maksimum dosya boyutu: ${fileSizeMB}MB`;
        setErrors(prev => [...prev, error]);
        
        if (onError) {
          onError(error);
        }
        
        return false;
      }
      
      return true;
    });
    
    // Geçerli dosya yoksa işlemi durdur
    if (validFiles.length === 0) {
      return;
    }
    
    // Dosyaları simüle ederek yükle (gerçek API çağrısı burada yapılacak)
    validFiles.forEach(file => {
      // Dosya için progress başlat
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
      
      // Yükleme simülasyonu (gerçek API çağrısı ile değiştirilecek)
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          
          if (progress > 100) {
            clearInterval(interval);
            
            // Dosyayı ekle ve URL oluştur
            const fileWithUrl = {
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file),
              uploaded: true
            };
            
            const newFiles = multiple 
              ? [...files, fileWithUrl] 
              : [fileWithUrl]; // Tekli mod ise diğer dosyaları sil
            
            setFiles(newFiles);
            
            // Callback ile bildir
            if (onUpload) {
              onUpload(newFiles);
            }
            
            // Progress'i temizle
            setUploadProgress(prev => {
              const newState = {...prev};
              delete newState[file.name];
              return newState;
            });
          } else {
            // Progress'i güncelle
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
        }, 200);
      };
      
      // Yüklemeyi başlat
      simulateUpload();
    });
  };
  
  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* Hata mesajları */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl">
          <p className="font-medium text-sm mb-1">Yükleme hataları:</p>
          <ul className="text-xs list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Dosya yükleme alanı */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString()}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <svg 
          className="w-12 h-12 mx-auto text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        
        <p className="text-gray-700 font-medium">{uploadText}</p>
        <p className="text-gray-500 text-sm mt-1">
          {accept.map(type => type.split('/')[1].toUpperCase()).join(', ')} {multiple ? "dosyaları" : "dosyası"}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Maksimum boyut: {formatFileSize(maxSize)}
          {multiple && `, Maksimum ${maxFiles} dosya`}
        </p>
      </div>
      
      {/* Yükleme progress'i */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-3">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Yüklenen dosyalar */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Yüklenen Dosyalar</h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                  {file.type.includes('image') ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Sil"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Yükleme butonu */}
      {(files.length > 0 || Object.keys(uploadProgress).length > 0) && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={handleButtonClick}
            className="mr-2"
          >
            Dosya Ekle
          </Button>
          
          {files.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFiles([]);
                if (onUpload) {
                  onUpload([]);
                }
              }}
            >
              Tümünü Temizle
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 