import { useRouter } from 'next/dist/client/router';
import React, { PropsWithChildren } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
	href: string,
	bg_active_class?: string,
	text_active_class?: string,
	hover_active_class?: string,
	acl?: any
}

const AutoActiveLink = ({ children, href, bg_active_class, text_active_class, hover_active_class, acl }: PropsWithChildren<Props>) => {
	const pathname = usePathname();
	const active = pathname == href;


	if (acl !== undefined && !acl) {
		return <></>;
	}

	return (
		<li className={` mb-1`}>
			<Link href={href}
				className={cn(
					{ bg_active_class: bg_active_class && active },
					{ 'bg-primary-light': !bg_active_class && active },
					{ text_active_class: active },
					{ 'text-primary': !text_active_class && active },
					hover_active_class,
					{ 'hover:text-primary-dark': !hover_active_class },
					'flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all'
				)}
			>
				{children}

			</Link>
		</li>
	);
};

export default AutoActiveLink;
