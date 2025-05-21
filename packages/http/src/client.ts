/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-constructor */
import { stringify } from 'qs';

type PathToObject<Path extends string, T> = Path extends `${infer First}.${infer Rest}`
  ? { [K in First]: PathToObject<Rest, T> }
  : { [K in Path]: T };

export type RestfulResult<V extends string, T = unknown> = PathToObject<V, T>;

export interface RequestOptions<T> extends RequestInit {
  params?: Record<string, any>;
  headers?: Headers;
  state?: T;
}

export interface HttpClientOptions {
  // 传入工厂，因为有些值是会变的，不能在声明的时候写死
  headersFactory?: () => Headers;
}

export abstract class HttpClient<K extends string, T extends RestfulResult<K>, R extends Record<string, any>> {
  constructor(
    readonly host: string,
    readonly httpClientOptions: HttpClientOptions
  ) {}

  static getParamsString(options: RequestOptions<any>) {
    return options.params
      ? `?${stringify(options.params, {
          arrayFormat: 'repeat'
        })}`
      : '';
  }

  protected getHeaders(headers: Headers) {
    const defaultHeaders = this.httpClientOptions?.headersFactory?.() ?? new Headers();
    defaultHeaders.forEach((v, k) => headers.append(k, v));
    return headers;
  }

  get<S>(url: string, options: RequestOptions<R> = {}) {
    options.method = 'GET';
    return this.fetchPack(url, options) as Promise<RestfulResult<K, S> & T>;
  }

  post<S>(url: string, body: any, options: RequestOptions<R> = {}) {
    options.method = 'POST';
    options.body = JSON.stringify(body);
    return this.fetchPack(url, options) as Promise<RestfulResult<K, S> & T>;
  }

  put<S>(url: string, body: any, options: RequestOptions<R> = {}) {
    options.method = 'PUT';
    options.body = JSON.stringify(body);
    return this.fetchPack(url, options) as Promise<RestfulResult<K, S> & T>;
  }

  delete<S>(url: string, options: RequestOptions<R> = {}) {
    options.method = 'DELETE';
    return this.fetchPack(url, options) as Promise<RestfulResult<K, S> & T>;
  }

  postForm<S>(url: string, body: FormData, options: RequestOptions<R> = {}) {
    options.method = 'POST';
    options.body = body;
    return this.fetchPack(url, options) as Promise<RestfulResult<K, S> & T>;
  }

  abstract fetchPack(url: string, options: RequestOptions<R>): Promise<T | string | Blob>;
}
