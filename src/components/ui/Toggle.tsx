import React from 'react';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  helperText?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  className,
  helperText,
}) => {
  return (
    <Switch.Group>
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          {label && (
            <Switch.Label className="mr-4 text-sm font-medium text-gray-700">
              {label}
            </Switch.Label>
          )}
          <div className="flex items-center gap-3">
            <Switch
              checked={checked}
              onChange={onChange}
              className={twMerge(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                checked ? 'bg-blue-600' : 'bg-gray-200',
                className
              )}
            >
              <span
                className={twMerge(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  checked ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </Switch>
            <span className="text-sm text-gray-700">
              {checked ? 'Tak' : 'Nie'}
            </span>
          </div>
        </div>
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    </Switch.Group>
  );
};
