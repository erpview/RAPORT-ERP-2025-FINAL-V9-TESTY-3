import React from 'react';

interface MultiSelectValueProps {
  value: string;
  onClick?: (value: string) => void;
  isHighlighted?: boolean;
}

export const MultiSelectValue: React.FC<MultiSelectValueProps> = ({
  value,
  onClick,
  isHighlighted = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(value);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium transition-colors
        ${isHighlighted
          ? 'bg-[#2c3b67] text-white'
          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
        }`}
    >
      {value.trim()}
    </button>
  );
};
