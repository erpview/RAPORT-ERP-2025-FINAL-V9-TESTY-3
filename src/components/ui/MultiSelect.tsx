import React from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  value: string | string[];
  onChange: (value: string[]) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required,
  error,
  helperText,
}) => {
  // Convert string value to array if needed
  const normalizeValue = (val: string | string[]): string[] => {
    if (Array.isArray(val)) return val;
    return val ? val.split(',').map(v => v.trim()).filter(Boolean) : [];
  };

  const selectedValues = normalizeValue(value);

  const handleChange = (newValues: string[]) => {
    // Ensure values are trimmed and unique
    const cleanValues = Array.from(new Set(newValues.map(v => v.trim()))).filter(Boolean);
    onChange(cleanValues);
  };

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    onChange(newValues);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Listbox value={selectedValues} onChange={handleChange} multiple>
        <div className="relative mt-1">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm min-h-[42px]`}
          >
            <div className="flex flex-wrap gap-2 items-center pr-8">
              {selectedValues.length === 0 && (
                <span className="text-gray-500">Select options...</span>
              )}
              {selectedValues.map(val => {
                const option = options.find(opt => opt.value === val);
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium bg-[#F5F5F7] text-[#1d1d1f]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(val, e);
                    }}
                  >
                    {option ? option.label : val}
                    <XMarkIcon className="w-3.5 h-3.5 text-[#86868b]" />
                  </span>
                );
              })}
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </span>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-blue-600' : 'text-blue-600'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" 
      clipRule="evenodd" 
    />
  </svg>
);
