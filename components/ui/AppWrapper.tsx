import LoadingAbsolute from "@/components/loading";
import { ReactElement, useEffect, useState } from "react";
import Startup from "@/core/Startup";
import { MeHook } from "@/store/me/hooks";
import { usePathname, useRouter } from "next/navigation";
import Cookie from "@/lib/core/fetch/Cookie";
import posthog from 'posthog-js'


const AppWrapper = ({ children }: { children: ReactElement }) => {
	const [isFullyLoaded, setFullyLoaded] = useState(false);
	const sub = MeHook.useSubscription();
	const route = useRouter();
	const pathname = usePathname();
	const me = MeHook.useMe();

	useEffect(() => {
		(async () => {
			await Startup.init();
			await setFullyLoaded(true);


			if (process.env.NODE_ENV == 'production') {
				posthog.init('phc_hIquiq6C8gEvkdXx7GnIW3OWnRn0pGAC4mcNoCxkiIh', { api_host: 'https://app.posthog.com' })
			}

		})()

	}, []);


	useEffect(() => {

		if (me) {
			if (Cookie.fromDocument('mobile') && (sub && Number(sub.is_effective))) {

				if (pathname.indexOf('mobile/') == -1) {
					console.log('reload');

					if (typeof window !== 'undefined') {
						//@ts-ignore
						window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'reload' }));
						return;
					}

				}

			}

			//@ts-ignore
			if (Cookie.fromDocument('mobile') && (!sub || sub.plan == 'free' || !Number(sub.is_effective))) {

				if (pathname.indexOf('me/') == -1 && pathname.indexOf('profile') == -1 && pathname.indexOf('admin') == -1) {
					route.push('/mobile/plans');
					return;
				}

			}

		}


	}, [sub, pathname, me]);


	return (<>
		{children}
	</>)
}

export default AppWrapper;