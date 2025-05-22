'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';

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
 * Supabase Storage kullanarak dosya yükleme, silme ve getirme işlemlerini gerçekleştirir.
 */
export function FileProvider({ children }) {
  // Yüklenmiş dosyaları saklamak için state
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  
  /**
   * Supabase Storage'a dosya yükleme işlemi
   * 
   * @param {File} file - Yüklenecek dosya
   * @param {Object} options - Yükleme seçenekleri
   * @param {string} options.bucket - Dosyanın yükleneceği bucket (varsayılan: 'public')
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
      bucket = 'public',
      path = 'general',
      fileName = file.name,
      onProgress,
      onSuccess,
      onError
    } = options;
    
    // Dosya adını temizleme (özel karakterler ve boşlukları kaldırma)
    const cleanFileName = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/gi, '_')
      .toLowerCase();
    
    // Benzersiz bir dosya adı oluştur
    const uniqueFileName = `${Date.now()}_${cleanFileName}`;
    
    // Tam dosya yolu
    const filePath = path ? `${path}/${uniqueFileName}` : uniqueFileName;
    
    // İlerleme durumunu takip etmek için dosya ID'si
    const fileId = `${bucket}_${filePath}`;
    
    // İlerleme durumunu güncelle
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    try {
      // Supabase Storage'a dosyayı yükle
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Dosya URL'ini al
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      // Dosya bilgilerini oluştur
      const fileInfo = {
        id: fileId,
        originalName: file.name,
        fileName: uniqueFileName,
        bucket: bucket,
        path: path,
        filePath: filePath,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: urlData.publicUrl,
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
   * Yüklenmiş bir dosyayı Supabase Storage'dan kaldırır
   * 
   * @param {string} fileId - Kaldırılacak dosyanın ID'si
   * @returns {Promise<boolean>} - İşlem başarılı ise true
   */
  const removeFile = useCallback(async (fileId) => {
    if (!fileId || !uploadedFiles[fileId]) return false;
    
    const fileInfo = uploadedFiles[fileId];
    
    try {
      // Supabase Storage'dan dosyayı sil
      const { error } = await supabase.storage
        .from(fileInfo.bucket)
        .remove([fileInfo.filePath]);
      
      if (error) throw error;
      
      // Dosya bilgilerini state'ten kaldır
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
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      return false;
    }
  }, [uploadedFiles]);

  /**
   * Dosyayı ID'sinden alır
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
   * @param {string} bucket - Dosyaların bulunduğu bucket (varsayılan: 'public')
   * @returns {Promise<Array<Object>>} - Dosya bilgileri dizisi
   */
  const getFilesByPath = useCallback(async (path, bucket = 'public') => {
    try {
      // Supabase Storage'dan dosyaları listele
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) throw error;
      
      // Dosya URL'lerini al
      const filesWithUrls = await Promise.all(
        data.map(async (item) => {
          if (item.id) {
            const filePath = path ? `${path}/${item.name}` : item.name;
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filePath);
            
            return {
              id: `${bucket}_${filePath}`,
              originalName: item.name,
              fileName: item.name,
              bucket: bucket,
              path: path,
              filePath: filePath,
              size: item.metadata?.size,
              mimeType: item.metadata?.mimetype,
              uploadedAt: item.created_at,
              url: urlData.publicUrl,
            };
          }
          return null;
        })
      );
      
      // null değerleri filtrele
      return filesWithUrls.filter(Boolean);
    } catch (error) {
      console.error('Dosya listeleme hatası:', error);
      return [];
    }
  }, []);

  /**
   * Tüm yüklenmiş dosyaları cache'ten temizler
   * Not: Bu işlem Supabase Storage'dan dosyaları silmez
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