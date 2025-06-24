import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'medium',
  hover = false,
  clickable = false,
  onClick,
}) => {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const baseClasses = [
    'bg-white rounded-2xl border border-gray-200 shadow-md',
    paddingClasses[padding],
    hover ? 'hover:shadow-lg transition-shadow duration-200' : '',
    clickable ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : '',
    className,
  ].join(' ');

  if (clickable && onClick) {
    return (
      <div
        className={baseClasses}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default Card;