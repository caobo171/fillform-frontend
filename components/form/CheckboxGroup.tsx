import React, { useEffect, useState } from 'react';
import { pull, union } from 'lodash';
import clsx from 'clsx';

import './CheckboxGroup.css';

type Option = {
  label: string;
  value: string;
};

type CheckboxGroupProps = {
  className?: string;
  direction?: 'vertical' | 'horizontal';
  options: Option[];
  onChange: (value: string[]) => void;
  value?: string[];
};

export function CheckboxGroup(props: CheckboxGroupProps) {
  const {
    className,
    options = [],
    direction = 'vertical',
    value,
    onChange,
    ...rest
  } = props;

  const [values, setValues] = useState<string[]>([]);

  const handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;

    const { name } = event.currentTarget.dataset;

    if (name === undefined) {
      return;
    }

    let newValues: string[] = [];

    if (checked) {
      newValues = union([name], values);
    } else {
      newValues = pull(values, name);
    }

    setValues(newValues);

    console.log(newValues);

    if (onChange) {
      onChange(newValues);
    }
  };

  useEffect(() => {
    setValues(value ?? []);
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
        <label key={item.value} className="checkbox-wrapper">
          <span className="checkbox-box">
            <input
              type="checkbox"
              className="checkbox-input"
              value={item.value}
              data-name={String(item.value)}
              onChange={handleOnChange}
              checked={values.includes(String(item.value))}
              {...rest}
            />
            <span className="checkbox-inner" />
          </span>

          <span className="checkbox-label">{item.label}</span>
        </label>
      ))}
    </div>
  );
}
