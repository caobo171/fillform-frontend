import clsx from 'clsx';

export function Container({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx('mx-auto container px-4 sm:px-6', className)}
      {...props}
    />
  );
}
