import { AxiosResponse } from 'axios'


type ONE_ERROR_ABORT_ALL = 1;//一个报错，终端所有的请求
type KEEP_ALL_BEEN_EXECUTED = 2;//一个报错，不影响其他的请求，调用者需要自己处理返回的错误

export type FailStrategy = ONE_ERROR_ABORT_ALL | KEEP_ALL_BEEN_EXECUTED;

interface ExtendedAxiosConfig {
  failStrategy: FailStrategy,
  retryCount: number,
  cacheType: null | 'memory' | 'localStorage',
  [otherAxiosConfigKey]: any,
};

export interface RuntimeConfig {
  dataVerifyRule?: null,
  pathDataVerifyRule?: {},
  ignoreHost?: false,
  /** 打印debug日志 */
  debug?: false,
  /** 重试次数 */
  retryCount?: number,
  /** 毫秒 */
  timeout?: number,
  cacheType?: null | 'memory' | 'localStorage',
  failStrategy?: FailStrategy
}

type IData = Record<string, any> | null;
type Method = 'get' | 'put' | 'del' | 'patch' | 'post' | 'jsonp';

export function request(
  spec: {
    method: Method,
    url: string,
    option?: ExtendedAxiosConfig,
    body?: IData,
  },
): Promise<AxiosResponse<T>[]>;


export function get<T extends any = any>(url: string, data: IData, extendedAxiosConfig: ExtendedAxiosConfig): Promise<AxiosResponse<T>>;

export function multiGet(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;


export function del<T extends any = any>(url: string, data: IData, extendedAxiosConfig: ExtendedAxiosConfig): Promise<AxiosResponse<T>>;

export function multiDel(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function put<T extends any = any>(url: string, data: IData, extendedAxiosConfig: ExtendedAxiosConfig): Promise<AxiosResponse<T>>;

export function multiPut(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function post<T extends any = any>(url: string, data: IData, extendedAxiosConfig: ExtendedAxiosConfig): Promise<AxiosResponse<T>>;

export function multiPost(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function patch<T extends any = any>(url: string, data: IData, extendedAxiosConfig: ExtendedAxiosConfig): Promise<AxiosResponse<T>>;

export function multiPatch(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function setConfig(config: RuntimeConfig): void;
