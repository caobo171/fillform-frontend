type Param = {
    key: string,
    value: number | string
}

export class UrlUtil {
    static normalizeUrl(uri: string) {
        return uri.normalize("NFD").replace(/\s/g, "+");
    }


    static getQueryString(search_params: any) {
        let object = Object.fromEntries(search_params.entries());
        return Object.keys(object).map(key => `${key}=${object[key]}`).join('&');
    }

    static getUrlQuery(object: any) {
        var array = Object.keys(object).map(e => ({
            key: e,
            value: object[e]
        }));

        return `?${UrlUtil.setAndGetURLParam(array)}`;
    }

    static setAndGetURLParam(params: Param[], is_array = "") {
        if (typeof window !== "undefined") {
            const queries = new URLSearchParams(window.location.search);
            for (let i = 0; i < params.length; i++) {
                if (params[i].value) {
                    queries.set(params[i].key, `${params[i].value}`);
                } else {
                    queries.delete(params[i].key)
                }

            }
            return queries.toString();
        }

        return ""
    }

    static getURLParams() {
        if (typeof window !== "undefined") {
            const queries = new URLSearchParams(window.location.search);
            let result: any = {};
            let entries = [...queries.entries()];
            for (let i = 0; i < entries.length; i++) {
                result[entries[i][0]] = entries[i][1];
            }
            return result;
        }
        return {}
    }


    static getURLParam(key: string) {
        if (typeof window !== "undefined") {
            const queries = new URLSearchParams(window.location.search);
            return queries.get(key);
        }
        return ''
    }


    static validLink(value: string) {
		return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '_').toLowerCase();
	};
}