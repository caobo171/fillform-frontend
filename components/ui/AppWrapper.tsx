import LoadingAbsolute from "@/components/loading";
import { ReactElement, useEffect, useState } from "react";
import Startup from "@/core/Startup";
import { MeHook } from "@/store/me/hooks";
import { usePathname, useRouter } from "next/navigation";
import Cookie from "@/lib/core/fetch/Cookie";
import posthog from 'posthog-js'
import { SocketService } from "@/services/SocketClient";
import { useMe } from "@/hooks/user";
import { Toast } from "@/services/Toast";

const AppWrapper = ({ children }: { children: ReactElement }) => {
	const [isFullyLoaded, setFullyLoaded] = useState(false);;
	const me = useMe();

	useEffect(() => {
		(async () => {
			await Startup.init();
			await setFullyLoaded(true);
		})()

	}, []);



	useEffect(() => {
		if (me.data) {
			SocketService.connect(me.data);

			SocketService.socket.on('credit_update', (data: any) => {
				console.log('credit_update', data);
				Toast.success('Nạp tiền thành công!');
				me.mutate();
			});

		}


	}, [me]);


	return (<>
		{children}
	</>)
}

export default AppWrapper;