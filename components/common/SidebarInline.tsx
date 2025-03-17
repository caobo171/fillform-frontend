import clsx from 'clsx';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

type SidebarItem = {
  icon?: React.ElementType;
  title: string;
  href?: string;
  active?: boolean;
  className?: string;
  highlight?: boolean;
};

type SidebarInlineProps = {
  items: SidebarItem[];
  className?: string;
};

export function SidebarInline({ items, className }: SidebarInlineProps) {
  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {items.map((item) => (
        <Link
          key={item.href ?? item.title}
          href={item.href ?? '#'}
          className={twMerge(
            'text-sm text-gray-500 flex items-center gap-3 h-8 hover:text-gray-700 hover:bg-gray-100 rounded-md px-2',
            clsx({
              'text-primary bg-primary-50 hover:text-primary hover:bg-primary-50':
                !!item.active,
            })
          )}
        >
          {item.icon && <item.icon className="h-5 w-5" />}
          <span className="flex-1">{item.title}</span>

          {item.highlight && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
