import { useState, FormEvent } from 'react';
import { PhoneModel, PhonePart, Language, StoreSettings } from '../types';
import { t } from '../translations';
import { Trash2, Edit2, Plus, LogOut, Check, X, ShieldCheck, Settings, Save } from 'lucide-react';

interface AdminPanelProps {
  models: PhoneModel[];
  setModels: (models: PhoneModel[]) => void;
  lang: Language;
  storeSettings: StoreSettings;
  setStoreSettings: (settings: StoreSettings) => void;
}

export default function AdminPanel({ models, setModels, lang, storeSettings, setStoreSettings }: AdminPanelProps) {
  const dict = t[lang];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PhoneModel>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [confirmPassword, setConfirmPassword] = useState(storeSettings.adminPassword || '');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const correctUsername = storeSettings.adminUsername || 'admin';
    const correctPassword = storeSettings.adminPassword || 'admin123';
    
    if (username === correctUsername && password === correctPassword) {
      setLoginSuccess('Login Successful!');
      setError('');
      setTimeout(() => {
        setLoginSuccess('');
        setIsAuthenticated(true);
      }, 1500);
    } else {
      setError('Invalid username or password!');
      setLoginSuccess('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure?')) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const startEdit = (model: PhoneModel) => {
    setEditingId(model.id);
    setEditForm({ ...model, parts: model.parts.map(p => ({ ...p })) });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleAddPart = () => {
    const newPart: PhonePart = { id: Date.now().toString(), name: '', price: 0, warrantyPeriod: '' };
    setEditForm(prev => ({
      ...prev,
      parts: [...(prev.parts || []), newPart]
    }));
  };

  const handleRemovePart = (partId: string) => {
    setEditForm(prev => ({
      ...prev,
      parts: (prev.parts || []).filter(p => p.id !== partId)
    }));
  };

  const handlePartChange = (partId: string, field: 'name' | 'price' | 'warrantyPeriod', value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      parts: (prev.parts || []).map(p => p.id === partId ? { ...p, [field]: value } : p)
    }));
  };

  const saveEdit = () => {
    if (!editForm.name) return;
    
    // Filter out parts with no name
    const validParts = (editForm.parts || []).filter(p => p.name.trim() !== '');

    if (isAdding) {
      const newModel: PhoneModel = {
        id: Date.now().toString(),
        name: editForm.name,
        parts: validParts
      };
      setModels([...models, newModel]);
    } else {
      setModels(models.map(m => m.id === editingId ? { ...m, ...editForm, parts: validParts } as PhoneModel : m));
    }
    cancelEdit();
  };

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    
    if ((settingsForm.adminPassword || '') !== confirmPassword) {
      setSettingsError('Passwords do not match!');
      return;
    }

    const credentialsChanged = 
      settingsForm.adminUsername !== storeSettings.adminUsername || 
      settingsForm.adminPassword !== storeSettings.adminPassword;

    setStoreSettings(settingsForm);
    
    if (credentialsChanged) {
      setSettingsSuccess('Credentials updated! Please login again.');
      setTimeout(() => {
        setSettingsSuccess('');
        handleLogout();
      }, 2000);
    } else {
      setSettingsSuccess('Settings saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 3000);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm({ ...settingsForm, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] sm:min-h-[70vh]">
        <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 animate-in fade-in zoom-in-95">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dict.adminAuth}</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{dict.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {loginSuccess && <p className="text-green-500 text-sm">{loginSuccess}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium transition-colors mt-2 sm:mt-0">
              {dict.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderEditRow = (keyStr: string) => (
    <tr key={keyStr} className="bg-blue-50/30 dark:bg-blue-900/10 border-b border-gray-200 dark:border-gray-800">
      <td colSpan={3} className="p-6">
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{dict.modelName}</label>
            <input 
              type="text" 
              value={editForm.name || ''} 
              onChange={e => setEditForm({...editForm, name: e.target.value})} 
              className="w-full bg-white dark:bg-[#2c2c2e] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" 
              placeholder={dict.modelName} 
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{dict.parts}</label>
              <button onClick={handleAddPart} className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full flex items-center space-x-1">
                <Plus className="w-3 h-3" />
                <span>{dict.addPart}</span>
              </button>
            </div>
            
            {(editForm.parts || []).map((part, index) => (
              <div key={part.id} className="flex space-x-3 items-center">
                <input 
                  type="text" 
                  value={part.name} 
                  onChange={e => handlePartChange(part.id, 'name', e.target.value)} 
                  className="flex-1 bg-white dark:bg-[#2c2c2e] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" 
                  placeholder={dict.partName} 
                />
                <input 
                  type="number" 
                  value={part.price || ''} 
                  onChange={e => handlePartChange(part.id, 'price', Number(e.target.value))} 
                  className="w-32 bg-white dark:bg-[#2c2c2e] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" 
                  placeholder={dict.partPrice} 
                />
                <input 
                  type="text" 
                  value={part.warrantyPeriod || ''} 
                  onChange={e => handlePartChange(part.id, 'warrantyPeriod', e.target.value)} 
                  className="w-32 bg-white dark:bg-[#2c2c2e] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" 
                  placeholder={dict.warrantyPeriod} 
                />
                <button 
                  onClick={() => handleRemovePart(part.id)} 
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  title={dict.removePart}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!editForm.parts || editForm.parts.length === 0) && (
              <p className="text-sm text-gray-500 italic">No parts added yet.</p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{dict.save}</span>
            </button>
            <button onClick={cancelEdit} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
              <X className="w-4 h-4" />
              <span>{dict.cancel}</span>
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.adminPanel}</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => { setIsAdding(true); setEditingId('new'); setEditForm({ name: '', parts: [] }); }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{dict.addModel}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.logout}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store Settings</h3>
        </div>
        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
              <input
                type="text"
                value={settingsForm.name}
                onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                placeholder="e.g. iRepair Shop"
                className="w-full bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Logo (PNG/JPG)</label>
              <div className="flex items-center space-x-4">
                {settingsForm.logoUrl && (
                  <img src={settingsForm.logoUrl} alt="Preview" className="w-10 h-10 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-black" />
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2c2c2e] file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-[#3c3c3e] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Username</label>
              <input
                type="text"
                value={settingsForm.adminUsername || ''}
                onChange={e => setSettingsForm({ ...settingsForm, adminUsername: e.target.value })}
                placeholder="admin"
                className="w-full bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Password</label>
              <input
                type="password"
                value={settingsForm.adminPassword || ''}
                onChange={e => setSettingsForm({ ...settingsForm, adminPassword: e.target.value })}
                placeholder="Leave blank to keep unchanged"
                className="w-full bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {settingsError && <p className="text-red-500 text-sm mt-2">{settingsError}</p>}
          {settingsSuccess && <p className="text-green-500 text-sm mt-2">{settingsSuccess}</p>}
          
          <div className="flex pt-2">
            <button type="submit" className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#2c2c2e]/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{dict.modelName}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{dict.parts}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">{dict.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isAdding && renderEditRow('add-new')}
              
              {models.map(model => (
                editingId === model.id && !isAdding ? renderEditRow(`edit-${model.id}`) : (
                  <tr key={model.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2c2c2e]/50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{model.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {model.parts.length > 0 
                        ? model.parts.map(p => p.name).join(', ') 
                        : <span className="italic text-gray-400">No parts</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button onClick={() => startEdit(model)} className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(model.id)} className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              ))}
              
              {models.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No models found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}