import axios, { AxiosPromise } from 'axios';

import { AnyObject } from '@/store/interface';

import Cookie from './Cookie';
import { API_URL, Code } from '@/core/Constants';

type GetFetcherOptions = [string, AnyObject | undefined | null] | string;

type PostFetcherOptions = {
  arg: {
    payload: AnyObject;
    accessToken?: boolean | string;
  } & RequestInit;
};

class Fetch {
  private __base_url: string = API_URL;

  async postWithAccessToken<ResponseType>(
    url: string,
    params: Object,
    context: { access_token: string } | null = null,
    show_loading = true,
    cache = false
  ): Promise<AxiosPromise<ResponseType>> {
    return this.post<ResponseType>(
      url,
      {
        ...params,
        access_token: context
          ? context.access_token
          : Cookie.fromDocument('access_token'),
      },
      show_loading,
      cache
    );
  }

  async get<ResponseType>(
    url: string,
    params: any = {},
    show_loading = true
  ): Promise<AxiosPromise<ResponseType>> {
    const res = await axios.get(`${this.__base_url}${url}`, params);
    return res;
  }


  async download(url: string, params: any = {}, filename?: string): Promise<void> {
    try {
      // Use axios to get the file with responseType blob
      const response = await axios({
        url: `${this.__base_url}${url}`,
        method: 'POST',
        data: params,
        responseType: 'blob',
      });

      if (response.data.code == Code.Error) {
        throw new Error(response.data.message);
      }

      // Create a URL for the blob
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Use the provided filename or get it from the Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      const serverFilename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '')
        : '';

      link.download = filename || serverFilename || 'data.csv';

      // Append to the document, click, and clean up
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }


  async downloadWithAccessToken(
    url: string,
    params: Object = {},
    filename?: string,
    context: { access_token: string } | null = null
  ): Promise<void> {
    return this.download(
      url,
      {
        ...params,
        access_token: context
          ? context.access_token
          : Cookie.fromDocument('access_token'),
      },
      filename
    );
  }

  async post<ResponseType>(
    url: string,
    params: any = {},
    show_loading = true,
    cache = false
  ): Promise<AxiosPromise<ResponseType>> {
    if (typeof XMLHttpRequest === 'undefined') {
      // @ts-ignore
      return fetch(`${this.__base_url}${url}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        next: cache ? { revalidate: 10 } : undefined,
        cache: cache ? 'force-cache' : 'no-store', // TODO: optimize
      }).then(async (e) => {
        if (e.status != 200) {
          return { message: e.statusText, code: 0 };
        }
        return { data: await e.json() };
      });
    }

    if (typeof window !== 'undefined') {
      const form_data = new FormData();
      for (const k in params) {
        if (Array.isArray(params[k])) {
          for (let i = 0; i < params[k].length; i++) {
            form_data.append(`${k}[]`, params[k][i]);
          }
        } else if (params[k] != null && params[k] != undefined) {
          // @ts-ignore
          form_data.append(k, params[k]);
        }
      }

      const res = await axios.post(`${this.__base_url}${url}`, form_data, {});
      return res;
    }
    const res = await axios.post(`${this.__base_url}${url}`, params);
    return res;
  }

  async getFetcher(obj: GetFetcherOptions) {
    let url: string = typeof obj === 'string' ? obj : '';

    let args;

    if (Array.isArray(obj)) {
      [url, args] = obj;
    }

    const params = { ...args };

    const accessToken = args?.accessToken;

    if (typeof accessToken === 'string') {
      params.access_token = accessToken;
    } else if (typeof accessToken === 'undefined' || accessToken) {
      params.access_token = Cookie.fromDocument('access_token');
    }

    return this.post(url, params);
  }

  async postFetcher(url: string, options: PostFetcherOptions) {
    const { accessToken, payload } = options.arg;

    if (typeof accessToken === 'string') {
      payload.access_token = accessToken;
    } else if (typeof accessToken === 'undefined' || accessToken) {
      payload.access_token = Cookie.fromDocument('access_token');
    }

    return this.post(url, payload);
  }
}

export default new Fetch();
