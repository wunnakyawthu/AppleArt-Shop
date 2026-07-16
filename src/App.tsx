/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PhoneModel, Language, Theme, StoreSettings } from './types';
import Header from './components/Header';
import Calculator from './components/Calculator';
import AdminPanel from './components/AdminPanel';

const defaultModels: PhoneModel[] = [
  { 
    id: '1', 
    name: 'iPhone 15 Pro Max', 
    parts: [
      { id: '1-screen', name: 'Screen Replacement', price: 1050000, warrantyPeriod: '6 Months' },
      { id: '1-battery', name: 'Battery Replacement', price: 200000, warrantyPeriod: '3 Months' }
    ] 
  },
  { 
    id: '2', 
    name: 'iPhone 15 Pro', 
    parts: [
      { id: '2-screen', name: 'Screen Replacement', price: 950000, warrantyPeriod: '6 Months' },
      { id: '2-battery', name: 'Battery Replacement', price: 180000, warrantyPeriod: '3 Months' }
    ] 
  },
  { 
    id: '3', 
    name: 'iPhone 14 Pro Max', 
    parts: [
      { id: '3-screen', name: 'Screen Replacement', price: 850000, warrantyPeriod: '6 Months' },
      { id: '3-battery', name: 'Battery Replacement', price: 150000, warrantyPeriod: '3 Months' }
    ] 
  },
  { 
    id: '4', 
    name: 'iPhone 13 Pro', 
    parts: [
      { id: '4-screen', name: 'Screen Replacement', price: 650000, warrantyPeriod: '6 Months' },
      { id: '4-battery', name: 'Battery Replacement', price: 120000, warrantyPeriod: '3 Months' }
    ] 
  },
];

export default function App() {
  const [models, setModels] = useState<PhoneModel[]>(() => {
    const saved = localStorage.getItem('irepair_models');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          if (!parsed[0].parts) return defaultModels;
          if (parsed[0].parts.length > 0 && parsed[0].parts[0].warrantyPeriod === undefined) {
             return defaultModels;
          }
        }
        return parsed || defaultModels;
      } catch (e) {
        return defaultModels;
      }
    }
    return defaultModels;
  });
  
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<'calc' | 'admin'>('calc');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('irepair_store_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { name: '', logoUrl: '' };
      }
    }
    return { name: '', logoUrl: '' };
  });

  useEffect(() => {
    localStorage.setItem('irepair_models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem('irepair_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Header theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} view={view} setView={setView} storeSettings={storeSettings} />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'calc' ? (
          <Calculator models={models} lang={lang} />
        ) : (
          <AdminPanel models={models} setModels={setModels} lang={lang} storeSettings={storeSettings} setStoreSettings={setStoreSettings} />
        )}
      </main>
    </div>
  );
}
