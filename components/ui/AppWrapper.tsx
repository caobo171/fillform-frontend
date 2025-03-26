import LoadingAbsolute from "@/components/loading";
import { ReactElement, useEffect, useState } from "react";
import Startup from "@/core/Startup";
import { MeHook } from "@/store/me/hooks";
import { usePathname, useRouter } from "next/navigation";
import Cookie from "@/lib/core/fetch/Cookie";
import posthog from 'posthog-js'
import { SocketService } from "@/services/SocketClient";

const AppWrapper = ({ children }: { children: ReactElement }) => {
	const [isFullyLoaded, setFullyLoaded] = useState(false);;
	const route = useRouter();
	const pathname = usePathname();
	const me = MeHook.useMe();

	useEffect(() => {
		(async () => {
			await Startup.init();
			await setFullyLoaded(true);


		})()

	}, []);



	useEffect(() => {
		console.log('me', me);
		if (me) {
			SocketService.connect(me);

		}


	}, [me]);


	return (<>
		{children}
	</>)
}

export default AppWrapper;