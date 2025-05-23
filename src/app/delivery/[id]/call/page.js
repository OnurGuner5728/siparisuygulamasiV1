'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiPhoneCall, FiPhoneOff, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '@/lib/api';

export default function CallPage() {
  return <CallPageContent />;
}

function CallPageContent() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'connected', 'ended'
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [contactPerson, setContactPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (callStatus === 'connected') {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [callStatus]);
  
  useEffect(() => {
    const loadOrderAndContactData = async () => {
      if (!orderId) {
        setError('Sipariş ID\'si bulunamadı.');
        setLoading(false);
        router.replace('/profil/siparisler');
        return;
      }
      setLoading(true);
      try {
        const order = await api.getOrderById(orderId);
        
        if (!order) {
          setError('Sipariş bulunamadı.');
          setLoading(false);
          router.replace('/profil/siparisler');
          return;
        }
        
        if (order.store) {
          setContactPerson({
            type: 'store',
            name: order.store.name || 'Mağaza',
            phone: order.store.phone || 'Telefon Bilgisi Yok',
            photo: order.store.logo,
          });
        } else if (order.customer) {
          setContactPerson({
            type: 'customer',
            name: order.customer.name || 'Müşteri',
            phone: order.customer.phone || 'Telefon Bilgisi Yok',
            photo: order.customer.avatar_url || '/images/avatar-placeholder.png',
          });
        } else {
          setError('İletişim kurulacak kişi bilgisi eksik.');
          setLoading(false);
          return;
        }
        
        setTimeout(() => {
          setCallStatus('connected');
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.warn('Ses otomatik oynatılamadı:', e));
          }
        }, 1500);

      } catch (err) {
        console.error('Sipariş ve iletişim verileri yüklenirken hata:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrderAndContactData();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId, router]);
  
  const endCall = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCallStatus('ended');
    if (audioRef.current) audioRef.current.pause();
    setTimeout(() => router.back(), 1000);
  };
  
  const toggleMute = () => setMuted(!muted);
  const toggleSpeaker = () => setSpeaker(!speaker);
  
  const formatCallDuration = () => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (loading || !contactPerson && callStatus !== 'ended') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
        <div className="text-white text-center p-8 bg-gray-800 rounded-lg shadow-xl">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <FiPhoneCall className="w-16 h-16 text-blue-500 mb-6" />
            <p className="text-2xl font-semibold mb-2">{error ? 'Hata' : 'Bağlanıyor...'}</p>
            <p className="text-gray-400 text-lg">
              {error ? error : (contactPerson ? `${contactPerson.name} aranıyor...` : 'Lütfen bekleyin')}
            </p>
            {error && (
                <button 
                    onClick={() => router.back()}
                    className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded"
                >
                    Geri Dön
                </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col z-40">
      <audio ref={audioRef} loop className="hidden">
      </audio>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white pt-16 sm:pt-20">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-6 shadow-lg ring-4 ring-gray-700">
          {contactPerson?.photo ? (
            <img 
              src={contactPerson.photo} 
              alt={contactPerson.name} 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center rounded-full">
              <span className="text-5xl sm:text-6xl font-semibold text-white opacity-80">
                {contactPerson?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          {callStatus === 'connected' && (
            <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping-slow opacity-75"></div>
          )}
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold mb-1 tracking-tight">{contactPerson?.name || 'Bilinmeyen Kişi'}</h2>
        <p className="text-blue-300 text-lg mb-6">
          {callStatus === 'connecting' && 'Bağlantı kuruluyor...'}
          {callStatus === 'connected' && formatCallDuration()}
          {callStatus === 'ended' && 'Arama Sonlandırıldı'}
        </p>
        
        {callStatus === 'connecting' && (
          <div className="flex space-x-1.5 mb-10">
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }}></div>
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      
      <div className="p-6 sm:p-8 pb-10 sm:pb-12 bg-black bg-opacity-20 backdrop-blur-sm">
        <div className="flex justify-around items-center max-w-xs mx-auto">
          <button 
            onClick={toggleMute}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-200 ${
              muted ? 'bg-gray-600 bg-opacity-70 text-white' : 'bg-gray-700 bg-opacity-50 text-blue-300 hover:bg-gray-600'
            }`}
            aria-label={muted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
          >
            {muted ? <FiMicOff size={28} /> : <FiMic size={28} />}
          </button>
          
          <button 
            onClick={endCall}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-95 transition-transform duration-150"
            aria-label="Aramayı Sonlandır"
          >
            <FiPhoneOff size={36} />
          </button>
          
          <button 
            onClick={toggleSpeaker}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-200 ${
              speaker ? 'bg-gray-700 bg-opacity-50 text-blue-300 hover:bg-gray-600' : 'bg-gray-600 bg-opacity-70 text-white'
            }`}
            aria-label={speaker ? 'Hoparlörü Kapat' : 'Hoparlörü Aç'}
          >
            {speaker ? <FiVolume2 size={28} /> : <FiVolumeX size={28} />}
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 inset-x-0 text-center text-gray-400 text-xs px-4">
        <p>Bu görüşme easysiparis güvencesiyle yapılmaktadır.</p>
      </div>
    </div>
  );
} 