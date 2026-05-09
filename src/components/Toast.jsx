import React from 'react';
import { CheckCircle, X } from 'lucide-react';

export const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl text-white flex items-center gap-2 transform transition-all duration-300 ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {type === 'error' ? <X size={20} /> : <CheckCircle size={20} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-80"><X size={16} /></button>
    </div>
  );
};
