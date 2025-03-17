import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import './RadioGroup.css';

type Option = {
  label: string;
  value: string;
};

type RadioGroupProps = {
  className?: string;
  direction?: 'vertical' | 'horizontal';
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
};

export function RadioGroup(props: RadioGroupProps) {
  const {
    className,
    options,
    direction = 'horizontal',
    value,
    onChange,
    ...rest
  } = props;

  const [currentValue, setCurrentValue] = useState<string | undefined>(value);

  const handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    setCurrentValue(value);

    if (onChange) {
      onChange(value);
    }
  };

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <div
      className={clsx(
        'flex gap-2',
        { 'flex-col': direction === 'vertical' },
        className
      )}
    >
      {options.map((item) => (
        <label key={item.value} className="radio-wrapper text-gray-900">
          <span className="radio-box">
            <input
              type="radio"
              className="radio-input"
              value={item.value}
              checked={item.value === currentValue}
              onChange={handleOnChange}
              {...rest}
            />
            <span className="radio-inner" />
          </span>

          <span className="radio-label">{item.label}</span>
        </label>
      ))}
    </div>
  );
}
