import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

class Cookie {

	public fromContext(key: string, context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) {

		return this.fromText(key, context.req.headers.cookie ? context.req.headers.cookie.toString() : "")
	}


	public fromDocument(key: string) {
		return this.fromText(key, document.cookie);
	}


	public set(name: string, value: string, days: number) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path=/";
	};


	private fromText(name: string, text: string) {
		var name_eq = name + "=";
		var ca = text.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(name_eq) == 0) return c.substring(name_eq.length, c.length);
		}
		return null;
	}
}


export default new Cookie();