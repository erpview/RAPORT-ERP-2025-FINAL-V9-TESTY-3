import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface ArrayInputProps {
  label: string;
  description?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export const ArrayInput: React.FC<ArrayInputProps> = ({
  label,
  description,
  value,
  onChange,
  placeholder = 'Dodaj nową wartość...',
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addValue();
    }
  };

  const addValue = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const removeValue = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label className="block text-[15px] font-medium text-[#1d1d1f] mb-2">
        {label}
        {required && ' *'}
      </label>
      {description && (
        <p className="text-[13px] text-[#86868b] mb-2">
          {description}
        </p>
      )}

      <div className="sf-card p-2 space-y-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#F5F5F7] rounded-full text-[13px] font-medium text-[#1d1d1f]"
            >
              {item}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="p-0.5 hover:bg-[#E8E8ED] rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-[#86868b]" />
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="sf-input flex-1"
          />
          <button
            type="button"
            onClick={addValue}
            disabled={!inputValue.trim()}
            className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] disabled:opacity-50 disabled:cursor-not-allowed px-3"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArrayInput;