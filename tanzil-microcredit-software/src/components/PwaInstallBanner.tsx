import React, { useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';

export const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsOpen(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsOpen(false);
    }
  };

  if (!isOpen || !deferredPrompt) return null;

  return (
    <div className="bg-[#0a4635] text-white rounded-2xl p-5 shadow-lg mb-6 border border-emerald-800 w-full max-w-sm">
       <div className="flex gap-4">
         <Smartphone className="w-12 h-12 text-emerald-400 mt-1" />
         <div className="flex-1">
           <h3 className="font-bold text-lg mb-1">অ্যান্ড্রয়েড অ্যাপ (PWA) হিসেবে ইনস্টল করুন</h3>
           <p className="text-emerald-100 text-sm mb-3">মোবাইলে সরাসরি অ্যাপটি ব্যবহার করতে ইনস্টল করুন। এটি অফলাইনেও কাজ করে।</p>
         </div>
         <button onClick={() => setIsOpen(false)} className="text-emerald-200 hover:text-white mt-1 self-start"><X size={20}/></button>
       </div>
       <button onClick={handleInstall} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
         <Smartphone size={18} /> অ্যাপ ইনস্টল করুন (Install App)
       </button>
    </div>
  );
};
