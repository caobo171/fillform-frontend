import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type TypographyProps = {
  children: ReactNode;
  className?: string;
};

export function Caption({ children, className }: TypographyProps) {
  return (
    <h5
      className={twMerge(
        'font-bold text-lg tracking-[4px] text-gray-900',
        className
      )}
    >
      {children}
    </h5>
  );
}

export function CaptionSmall({ children, className }: TypographyProps) {
  return (
    <h6 className={twMerge('font-semibold text-xs text-gray-900', className)}>
      {children}
    </h6>
  );
}

export function Heading({ children, className }: TypographyProps) {
  return (
    <h1
      className={twMerge(
        'text-5xl leading-tight font-extrabold  text-gray-900 md:text-7xl md:leading-[80px]',
        className
      )}
    >
      {children}
    </h1>
  );
}

export function HeadingH2({ children, className }: TypographyProps) {
  return (
    <h2
      className={twMerge(
        'font-bold text-5xl leading-[1.15] text-gray-900',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function HeadingH3({ children, className }: TypographyProps) {
  return (
    <h3 className={twMerge('font-bold text-4xl text-gray-900', className)}>
      {children}
    </h3>
  );
}

export function HeadingH4({ children, className }: TypographyProps) {
  return (
    <h3 className={twMerge('font-bold text-2xl text-gray-900', className)}>
      {children}
    </h3>
  );
}

export function TextBody({ children, className }: TypographyProps) {
  return (
    <p className={twMerge('text-base text-gray-900', className)}>{children}</p>
  );
}

export function TextBodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={twMerge('text-lg text-gray-900', className)}>{children}</p>
  );
}

export function TextBodyHighLight({ children, className }: TypographyProps) {
  return (
    <p className={twMerge('text-base font-semibold text-gray-900', className)}>
      {children}
    </p>
  );
}
