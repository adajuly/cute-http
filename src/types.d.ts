import type { AxiosResponse } from 'axios';
import axiosMod from 'axios';


type ONE_ERROR_ABORT_ALL = 1; // 一个报错，终端所有的请求
type KEEP_ALL_BEEN_EXECUTED = 2; // 一个报错，不影响其他的请求，调用者需要自己处理返回的错误

export type FailStrategy = ONE_ERROR_ABORT_ALL | KEEP_ALL_BEEN_EXECUTED;

interface ExtendedAxiosConfig {
  failStrategy?: FailStrategy,
  retryCount?: number,
  cacheType?: null | 'memory' | 'localStorage',
  [otherAxiosConfigKey: string]: any,
}

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

export function request<T extends any = any>(
  spec: {
    method: Method,
    url: string,
    option?: ExtendedAxiosConfig,
    body?: IData,
  },
): Promise<AxiosResponse<T>[]>;


// CustomizedResponse will be AxiosResponse if no interceptors defined
type CustomizedResponse = any;

export function get<T = CustomizedResponse>(url: string, data?: IData, extendedAxiosConfig?: ExtendedAxiosConfig): Promise<T>;

export function multiGet<T extends any = any>(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;


export function del<T = CustomizedResponse>(url: string, data?: IData, extendedAxiosConfig?: ExtendedAxiosConfig): Promise<T>;

export function multiDel<T extends any = any>(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function put<T = CustomizedResponse>(url: string, data?: IData, extendedAxiosConfig?: ExtendedAxiosConfig): Promise<T>;

export function multiPut<T extends any = any>(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function post<T = CustomizedResponse>(url: string, data?: IData, extendedAxiosConfig?: ExtendedAxiosConfig): Promise<T>;

export function multiPost<T extends any = any>(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<AxiosResponse<T>[]>;

export function patch<T = CustomizedResponse>(url: string, data?: IData, extendedAxiosConfig?: ExtendedAxiosConfig): Promise<T>;

export function multiPatch<T = CustomizedResponse>(
  url: string[] | { url: string, data: IData }[],
  extendedAxiosConfig: ExtendedAxiosConfig,
): Promise<T[]>;

export function setConfig(config: RuntimeConfig): void;

export declare const cst: {
  // 缓存类型
  LOCAL_STORAGE: 'localStorage';
  MEMORY: 'memory';

  ERR_FETCH_FAILED_AFTER_RETRY: 10000;
  ERR_RESPONSE_DATA_TYPE_INVALID: 10001;

  //多个请求里，错误处理策略
  ONE_ERROR_ABORT_ALL: 1;//一个报错，终端所有的请求
  KEEP_ALL_BEEN_EXECUTED: 2;//一个报错，不影响其他的请求，调用者需要自己处理返回的错误
};

export declare const axios: typeof axiosMod;
