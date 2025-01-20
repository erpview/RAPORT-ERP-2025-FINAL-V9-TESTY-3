import React from 'react';
import { MultiSelectValue } from './MultiSelectValue';
import { normalizeMultiselectValue } from '../../utils/fieldUtils';

interface MultiSelectDisplayProps {
  value: string | string[];
  onClick?: (value: string) => void;
  isValueHighlighted?: (value: string) => boolean;
}

export const MultiSelectDisplay: React.FC<MultiSelectDisplayProps> = ({
  value,
  onClick,
  isValueHighlighted = () => false,
}) => {
  // Use the utility function to normalize the value
  const values = React.useMemo(() => normalizeMultiselectValue(value), [value]);

  if (!values.length) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {values.map((val, index) => (
        <MultiSelectValue
          key={`${val}-${index}`}
          value={val}
          onClick={onClick}
          isHighlighted={isValueHighlighted(val)}
        />
      ))}
    </div>
  );
};
