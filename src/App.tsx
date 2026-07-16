/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PhoneModel, Language, Theme, StoreSettings } from './types';
import Header from './components/Header';
import Calculator from './components/Calculator';
import AdminPanel from './components/AdminPanel';
import { supabase } from './supabaseClient'; // Supabase ချိတ်ဆက်မှု

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<'calc' | 'admin'>('calc');
  const [models, setModels] = useState<PhoneModel[]>([]); // Database က Data တွေ ဒီထဲဝင်လာမယ်
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ name: '', logoUrl: '' });

  // Database ကနေ Data ဆွဲထုတ်ခြင်း
  useEffect(() => {
    const loadData = async () => {
      // ၁။ Models တွေကို ဆွဲထုတ်မယ်
      const { data: modelsData } = await supabase.from('phone_models').select('*');
      // ၂။ Parts တွေကို ဆွဲထုတ်မယ်
      const { data: partsData } = await supabase.from('repair_parts').select('*');

      if (modelsData && partsData) {
        const combinedData = modelsData.map((m: any) => ({
          id: m.id.toString(),
          name: m.name,
          parts: partsData
            .filter((p: any) => p.model_id === m.id)
            .map((p: any) => ({
              id: p.id.toString(),
              name: p.part_name,
              price: p.price,
              warrantyPeriod: p.warranty
            }))
        }));
        setModels(combinedData);
      }
    };
    
    loadData();
  }, []);

  // Theme အပြောင်းအလဲ
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Header 
        theme={theme} setTheme={setTheme} 
        lang={lang} setLang={setLang} 
        view={view} setView={setView} 
        storeSettings={storeSettings} 
      />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'calc' ? (
          <Calculator models={models} lang={lang} />
        ) : (
          <AdminPanel 
            models={models} 
            setModels={setModels} 
            lang={lang} 
            storeSettings={storeSettings} 
            setStoreSettings={setStoreSettings} 
          />
        )}
      </main>
    </div>
  );
}
