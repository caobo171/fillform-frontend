import clsx from 'clsx';

type FormCardProps = {
  className?: string;
  direction?: 'vertical' | 'horizontal';
  children: React.ReactNode;
};

export function FormCard({
  className,
  direction = 'vertical',
  children,
}: FormCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded p-6 flex gap-8',
        { 'flex-col': direction === 'vertical' },
        className
      )}
    >
      {children}
    </div>
  );
}
