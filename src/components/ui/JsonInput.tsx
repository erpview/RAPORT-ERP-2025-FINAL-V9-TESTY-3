import React, { useState, useEffect } from 'react';
import { TextArea } from './TextArea';

interface JsonInputProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: any;
}

export const JsonInput: React.FC<JsonInputProps> = ({
  label,
  value,
  onChange,
  placeholder
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setText(JSON.stringify(value, null, 2));
    } catch (e) {
      setText('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError('Nieprawidłowy format JSON');
    }
  };

  return (
    <div className="space-y-2">
      <TextArea
        label={label}
        value={text}
        onChange={handleChange}
        placeholder={JSON.stringify(placeholder, null, 2)}
        error={error ?? undefined}
        rows={10}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
