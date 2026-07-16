import { useState, useMemo, useEffect } from 'react';
import { PhoneModel, Language } from '../types';
import { t } from '../translations';
import { ChevronDown } from 'lucide-react';

interface CalculatorProps {
  models: PhoneModel[];
  lang: Language;
}

const formatMMK = (amount: number) => {
  return amount.toLocaleString('en-US') + ' MMK';
};

export default function Calculator({ models, lang }: CalculatorProps) {
  const dict = t[lang];
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [selectedPartIds, setSelectedPartIds] = useState<Record<string, boolean>>({});

  const selectedModel = useMemo(() => 
    models.find(m => m.id === selectedModelId), 
  [models, selectedModelId]);

  // Reset discounts and selections when switching models
  useEffect(() => {
    setDiscounts({});
    setSelectedPartIds({});
  }, [selectedModelId]);

  const handleDiscountChange = (partId: string, value: number) => {
    setDiscounts(prev => ({ ...prev, [partId]: value }));
  };

  const togglePartSelection = (partId: string) => {
    setSelectedPartIds(prev => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

  const totalBill = useMemo(() => {
    if (!selectedModel) return 0;
    return selectedModel.parts.reduce((sum, part) => {
      if (!selectedPartIds[part.id]) return sum;
      const d = discounts[part.id] || 0;
      return sum + (part.price * (1 - d / 100));
    }, 0);
  }, [selectedModel, discounts, selectedPartIds]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Model Selection */}
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-gray-200/50 dark:border-gray-800/50">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {dict.selectModel}
        </label>
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full appearance-none bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl px-4 py-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-lg font-medium"
          >
            <option value="">-- {dict.selectModel} --</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {!selectedModel ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-[#1c1c1e]/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
          {dict.noModelSelected}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {selectedModel.parts.map(part => {
            const isSelected = !!selectedPartIds[part.id];
            const discount = discounts[part.id] || 0;
            const finalPrice = part.price * (1 - discount / 100);
            
            return (
              <div 
                key={part.id} 
                onClick={() => togglePartSelection(part.id)}
                className={`bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border transition-all duration-200 flex flex-col cursor-pointer ${isSelected ? 'border-blue-600 ring-1 ring-blue-600 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-transparent dark:border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
              >
                <div className="mb-4 md:mb-6 flex justify-between items-center">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white select-none line-clamp-2">
                    {part.name}
                  </h3>
                </div>
                
                <div className="space-y-3 md:space-y-4 flex-grow">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{dict.originalPrice}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatMMK(part.price)}</span>
                  </div>
                  
                  {part.warrantyPeriod && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{dict.warranty}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right">{part.warrantyPeriod}</span>
                    </div>
                  )}
                  
                  <div className="pt-1 md:pt-2" onClick={(e) => e.stopPropagation()}>
                    <label className="flex justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1.5 md:mb-2">
                      <span>{dict.discount}</span>
                      <span className={discount > 0 ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
                        {discount > 0 ? `-${discount}%` : '0%'}
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={discount}
                        onChange={(e) => handleDiscountChange(part.id, Number(e.target.value))}
                        className="w-full appearance-none bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 md:px-4 md:py-3 pr-8 md:pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-xs md:text-sm font-medium"
                      >
                        <option value={0}>0% (No Discount)</option>
                        {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(pct => (
                          <option key={pct} value={pct}>{pct}%</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 md:px-4 text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-8 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                  <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">{dict.finalPrice}</span>
                  <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 leading-none">{formatMMK(finalPrice)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedModel && (
        <div className="bg-blue-600 dark:bg-blue-900/40 text-white rounded-3xl p-8 shadow-lg flex flex-col sm:flex-row justify-between items-center animate-in zoom-in-95 duration-300">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <h2 className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">{dict.totalBill}</h2>
            <p className="text-lg font-medium">{selectedModel.name}</p>
          </div>
          <div className="text-4xl font-bold tracking-tight">
            {formatMMK(totalBill)}
          </div>
        </div>
      )}
    </div>
  );
}
