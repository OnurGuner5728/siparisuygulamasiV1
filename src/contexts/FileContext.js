'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Dosya yükleme için Context oluşturma
const FileContext = createContext();

// Context hook
export const useFileUpload = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileUpload hook must be used within a FileProvider');
  }
  return context;
};

/**
 * Dosya işlemleri için Provider bileşeni
 * 
 * Mock bir API olduğu için gerçek bir upload işlemi yapmak yerine
 * dosyaları local storage'da saklar ve base64 formatında döndürür.
 */
export function FileProvider({ children }) {
  // Yüklenmiş dosyaları saklamak için state
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  
  /**
   * Dosya yükleme işlemi
   * 
   * @param {File} file - Yüklenecek dosya
   * @param {Object} options - Yükleme seçenekleri
   * @param {string} options.path - Yükleme yolu (dosya kategorisi)
   * @param {string} options.fileName - Dosya adı (belirtilmezse orijinal isim kullanılır)
   * @param {function} options.onProgress - İlerleme durumu callback fonksiyonu
   * @param {function} options.onSuccess - Başarılı yükleme callback fonksiyonu
   * @param {function} options.onError - Hata durumunda callback fonksiyonu
   * @returns {Promise<Object>} - Yüklenen dosya bilgileri
   */
  const uploadFile = useCallback(async (file, options = {}) => {
    if (!file) return null;
    
    const {
      path = 'general',
      fileName = file.name,
      onProgress,
      onSuccess,
      onError
    } = options;
    
    // Benzersiz bir ID oluştur
    const fileId = `${path}_${Date.now()}_${fileName}`;
    
    // İlerleme durumunu güncelle
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    try {
      // Base64 formatına dönüştürme
      const base64String = await fileToBase64(file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        if (onProgress) onProgress(progress);
      });
      
      // Dosya bilgilerini oluştur
      const fileInfo = {
        id: fileId,
        originalName: file.name,
        fileName: fileName,
        path: path,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: base64String,
      };
      
      // Dosyayı kaydet
      setUploadedFiles(prev => ({ ...prev, [fileId]: fileInfo }));
      
      // Yükleme tamamlandı
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      if (onSuccess) onSuccess(fileInfo);
      return fileInfo;
    } catch (error) {
      // Hata durumunu güncelle
      setUploadErrors(prev => ({ ...prev, [fileId]: error.message }));
      
      if (onError) onError(error);
      throw error;
    }
  }, []);

  /**
   * Dosyayı base64 formatına dönüştürür
   * 
   * @param {File} file - Dönüştürülecek dosya
   * @param {function} onProgress - İlerleme durumu callback fonksiyonu
   * @returns {Promise<string>} - Base64 formatındaki dosya
   */
  const fileToBase64 = (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        if (onProgress) onProgress(0);
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Dosya okunamadı.'));
      };
      
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result);
      };
      
      reader.readAsDataURL(file);
    });
  };

  /**
   * Yüklenmiş bir dosyayı kaldırır
   * 
   * @param {string} fileId - Kaldırılacak dosyanın ID'si
   * @returns {boolean} - İşlem başarılı ise true
   */
  const removeFile = useCallback((fileId) => {
    if (!fileId || !uploadedFiles[fileId]) return false;
    
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fileId];
      return newFiles;
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
    
    return true;
  }, [uploadedFiles]);

  /**
   * Dosyayı URL'inden alır
   * 
   * @param {string} fileId - Dosyanın ID'si
   * @returns {Object|null} - Dosya bilgileri veya null
   */
  const getFileById = useCallback((fileId) => {
    return uploadedFiles[fileId] || null;
  }, [uploadedFiles]);

  /**
   * Belirli bir klasördeki tüm dosyaları getirir
   * 
   * @param {string} path - Klasör yolu
   * @returns {Array<Object>} - Dosya bilgileri dizisi
   */
  const getFilesByPath = useCallback((path) => {
    return Object.values(uploadedFiles).filter(file => file.path === path);
  }, [uploadedFiles]);

  /**
   * Tüm yüklenmiş dosyaları temizler
   */
  const clearAllFiles = useCallback(() => {
    setUploadedFiles({});
    setUploadProgress({});
    setUploadErrors({});
  }, []);

  // Context değerini oluştur
  const value = {
    uploadedFiles,
    uploadProgress,
    uploadErrors,
    uploadFile,
    removeFile,
    getFileById,
    getFilesByPath,
    clearAllFiles,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

// Varsayılan olarak FileProvider'ı dışa aktar
export default FileProvider; 