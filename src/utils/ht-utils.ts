/**
 * 壶天自研工具集（ht-utils）
 *
 * 用于替代原 pure-admin 模板引入的工具库依赖。除 useDark / useResizeObserver
 * 外均为手写实现，每个函数头部均注明与原包对齐的签名与行为；原包类型声明已
 * 存档于 docs/vendor-ref/ 目录，可随时对照。
 */

import {
  type ShallowRef,
  computed,
  getCurrentInstance,
  getCurrentScope,
  nextTick,
  onBeforeMount,
  onScopeDispose,
  onUnmounted,
  shallowRef,
  toValue,
  watch,
  type Plugin,
  type Ref
} from "vue";

/* -------------------------------------------------------------------------- */
/*                                  类型声明                                   */
/* -------------------------------------------------------------------------- */

/** 对齐原包 `FunctionArgs` */
type FunctionArgs<Args extends any[] = any[], Return = void> = (
  ...args: Args
) => Return;

/** 对齐原包 `Target` */
export type Target = "_blank" | "_self" | "_parent" | "_top" | "framename";

/** 对齐原包 `ProxyStorage` */
export interface ProxyStorage {
  setItem<T>(k: string, v: T): void;
  getItem<T>(k: string): T;
  removeItem(k: string): void;
  clear(): void;
}

/** 对齐原包 `SvgInfo` */
export interface SvgInfo {
  /** SVG 的宽度，基于 `viewBox` 属性的第三个值 */
  width: number;
  /** SVG 的高度，基于 `viewBox` 属性的第四个值 */
  height: number;
  /** SVG 中所有 `<path>` 元素的 `outerHTML` 连接而成的字符串 */
  body: string;
}

/** 对齐原包 `DarkOptions` */
export interface DarkOptions {
  /** 切换的主题类名，默认 `dark` */
  className?: string;
  /** 监听的节点，`html`（默认）或 `body` */
  selector?: "html" | "body";
}

/** useDark 的返回结构，对齐原包 */
export interface DarkReturn {
  /** 当前整个网页是否处于暗色(`dark`)主题 */
  isDark: ShallowRef<boolean>;
  /** `dark`和非`dark`主题间相互切换 */
  toggleDark: () => void;
}

/** 对齐原包 `UseResizeObserverOptions` */
export interface UseResizeObserverOptions {
  /** 内置防抖时长，单位毫秒，默认 `40` */
  time?: number;
  /** 观察的盒子模型，默认 `content-box` */
  box?: "content-box" | "border-box";
  /** 首次是否立即执行回调，默认 `true` */
  immediate?: boolean;
}

/** 对齐原包 `SFCWithInstall` */
export type SFCWithInstall<T> = T & Plugin;

/* -------------------------------------------------------------------------- */
/*                                基础类型判断                                 */
/* -------------------------------------------------------------------------- */

const toString = Object.prototype.toString;

/** `Object.prototype.toString.call(val) === "[object type]"` 的封装（内部实现） */
function is(val: unknown, type: string): boolean {
  return toString.call(val) === `[object ${type}]`;
}

/** 是否是 `null`（内部实现） */
function isNull(val: unknown): val is null {
  return val === null;
}

/** 是否是 `undefined`（内部实现） */
function isUnDef(val?: unknown): val is undefined {
  return typeof val === "undefined";
}

/** 是否是 `null` 或者 `undefined`（内部实现） */
export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isNull(val) || isUnDef(val);
}

/** 是否是对象 `object`。签名与行为对齐原包 `isObject` */
export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, "Object");
}

/** 是否是 `number`。签名与行为对齐原包 `isNumber` */
export function isNumber(val: unknown): val is number {
  return is(val, "Number");
}

/** 是否是 `string`。签名与行为对齐原包 `isString` */
export function isString(val: unknown): val is string {
  return is(val, "String");
}

/** 是否是 `Function`。签名与行为对齐原包 `isFunction` */
export function isFunction(val: unknown): val is Function {
  return typeof val === "function";
}

/** 是否是 `Boolean`。签名与行为对齐原包 `isBoolean` */
export function isBoolean(val: unknown): val is boolean {
  return is(val, "Boolean");
}

/** 是否是 `Array`。签名与行为对齐原包 `isArray` */
export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val);
}

/**
 * 是否为空，针对 `数组`、`对象`、`字符串`、`new Map()`、`new Set()` 进行判断。
 * 签名与行为对齐原包 `isEmpty`
 */
export function isEmpty<T = unknown>(val: T): boolean {
  if (isArray(val) || isString(val)) return (val as any).length === 0;
  if (val instanceof Map || val instanceof Set) return val.size === 0;
  if (isObject(val)) return Object.keys(val).length === 0;
  return false;
}

/**
 * 是否为空：在 `isEmpty` 基础上，`null`、`undefined` 直接返回 `true`。
 * 签名与行为对齐原包 `isAllEmpty`
 */
export function isAllEmpty<T = unknown>(val: T): boolean {
  return !!(isEmpty(val) || isNullOrUnDef(val));
}

/* -------------------------------------------------------------------------- */
/*                                 深度对比                                    */
/* -------------------------------------------------------------------------- */

/** 判断两个数组是否相等（逐项调用 isEqual，内部实现，对齐原包 `isEqualArray`） */
function isEqualArray(arr: any, other: any): boolean {
  if (!arr || !other) return false;
  const { length } = arr;
  if (length !== other.length) return false;
  for (let i = 0; i < length; i++) {
    if (!isEqual(arr[i], other[i])) return false;
  }
  return true;
}

/**
 * 判断两者是否相等（深度对比：对象、数组、Date、RegExp、Map、Set、函数逐项比较）。
 * 签名与行为对齐原包 `isEqual`
 */
export function isEqual(a: unknown, b: unknown, seen = new WeakMap()): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp)
    return a.toString() === b.toString();
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqual(value, b.get(key), seen)) return false;
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) return isEqualArray(a, b);
  if (
    a !== null &&
    typeof a === "object" &&
    !Array.isArray(a) &&
    b !== null &&
    typeof b === "object" &&
    !Array.isArray(b)
  ) {
    if (seen.has(a as object)) return seen.get(a) === b;
    seen.set(a as object, b);
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(b, key) ||
        !isEqual((a as any)[key], (b as any)[key], seen)
      )
        return false;
    }
    return true;
  }
  if (isFunction(a) && isFunction(b))
    return a === b || a.toString() === b.toString();
  return false;
}

/* -------------------------------------------------------------------------- */
/*                                 防抖/节流                                   */
/* -------------------------------------------------------------------------- */

/** 延迟函数，默认 `20` 毫秒。签名与行为对齐原包 `delay` */
export const delay = (timeout = 20): Promise<unknown> =>
  new Promise(resolve => setTimeout(resolve, timeout));

/**
 * 防抖函数，默认 `200` 毫秒；`immediate` 为 `true` 时首次立即执行。
 * 签名与行为对齐原包 `debounce`
 */
export const debounce = <T extends FunctionArgs>(
  fn: T,
  timeout = 200,
  immediate = false
): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function (this: unknown, ...args: any[]) {
    if (timer) clearTimeout(timer);
    if (immediate) {
      if (!timer) fn.call(this, ...args);
      timer = setTimeout(() => (timer = undefined), timeout);
    } else {
      timer = setTimeout(() => fn.call(this, ...args), timeout);
    }
  };
};

/** 节流函数，默认 `1000` 毫秒。签名与行为对齐原包 `throttle` */
export const throttle = <T extends FunctionArgs>(
  fn: T,
  timeout = 1000
): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function (this: unknown, ...args: any[]) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.call(this, ...args);
      timer = undefined;
    }, timeout);
  };
};

/* -------------------------------------------------------------------------- */
/*                                  深拷贝                                     */
/* -------------------------------------------------------------------------- */

const _toString = Object.prototype.toString;

function _cloneValue(val: any): any {
  if (!val) return val;
  switch (_toString.call(val)) {
    case "[object Object]": {
      const ret = Object.create(Object.getPrototypeOf(val));
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          ret[key] = _deepClone(val[key], true);
        }
      }
      return ret;
    }
    case "[object Date]":
    case "[object RegExp]":
      return new val.constructor(val.valueOf());
    case "[object Array]":
    case "[object Arguments]": {
      const ret: any[] = [];
      val.forEach((item: any) => ret.push(_deepClone(item, true)));
      return ret;
    }
    case "[object Set]": {
      const ret = new val.constructor();
      val.forEach((item: any) => ret.add(_deepClone(item, true)));
      return ret;
    }
    case "[object Map]": {
      const ret = new val.constructor();
      val.forEach((item: any, key: any) =>
        ret.set(key, _deepClone(item, true))
      );
      return ret;
    }
    default:
      return val;
  }
}

function _deepClone(val: any, deep: boolean): any {
  return deep ? _cloneValue(val) : val;
}

/** 深拷贝（支持 Object/Array/Date/RegExp/Set/Map/Arguments）。签名与行为对齐原包 `cloneDeep` */
export function cloneDeep(val: any): any {
  return val && _cloneValue(val);
}

/* -------------------------------------------------------------------------- */
/*                                字符串截取                                   */
/* -------------------------------------------------------------------------- */

/** 截取指定字符前面的值（找不到返回空串）。签名与行为对齐原包 `subBefore` */
export function subBefore(val: string, character: string): string {
  return isString(character) ? val.substring(0, val.indexOf(character)) : "";
}

/** 截取指定字符后面的值（找不到返回空串）。签名与行为对齐原包 `subAfter` */
export function subAfter(val: string, character: string): string {
  return isString(character)
    ? val.substring(val.lastIndexOf(character) + character.length, val.length)
    : "";
}

/* -------------------------------------------------------------------------- */
/*                                   正则                                      */
/* -------------------------------------------------------------------------- */

/** `url` 链接正则校验。签名与行为对齐原包 `isUrl` */
export function isUrl(value: string): boolean {
  const reg =
    "^(?:(https?|ftp|rtsp|mms|ws|wss)://)?(?:\\S+(?::\\S*)?@)?(?:(?:localhost)|(?:[1-9]\\d{0,2}(?:\\.\\d{1,3}){3})|(?:\\[[0-9a-fA-F:]+\\])|(?:(?:[a-zA-Z0-9-_]+\\.)+[a-zA-Z]{2,63}))(?::\\d{1,5})?(?:[/?#]\\S*)?$";
  return new RegExp(reg, "i").test(value);
}

/* -------------------------------------------------------------------------- */
/*                                   数组                                      */
/* -------------------------------------------------------------------------- */

/**
 * 判断母体数组 `m` 是否包含子体数组 `c` 中的全部元素（严格相等比较）。
 * 签名与行为对齐原包 `isIncludeAllChildren`
 */
export function isIncludeAllChildren(
  c: Array<string | number | unknown>,
  m: Array<unknown>
): boolean {
  return c.every(item => m.some(other => other === item));
}

/** 获取由基本数据类型组成的数组交集。签名与行为对齐原包 `intersection` */
export const intersection = (...rest: any[]): any[] =>
  [...rest].reduce((a, b) => a.filter(item => b.includes(item)));

/**
 * 从对象数组中获取指定 `key` 组成的新数组，会去重也会去除不存在的值。
 * 签名与行为对齐原包 `getKeyList`
 */
export function getKeyList(arr: any, key: string, duplicates = true): any[] {
  const list: any[] = [];
  for (const item of arr) {
    if (item[key] !== undefined && item[key] !== null) list.push(item[key]);
  }
  return duplicates ? Array.from(new Set(list)) : list;
}

/* -------------------------------------------------------------------------- */
/*                                    DOM                                     */
/* -------------------------------------------------------------------------- */

const isServer = typeof window === "undefined";
const isClient = !isServer;
const hasDocument = typeof document !== "undefined";

/** 判断元素是否存在指定类名。签名与行为对齐原包 `hasClass` */
export const hasClass = (
  element: HTMLElement | Element,
  name: string
): boolean =>
  hasDocument
    ? !!element?.className.match(new RegExp("(\\s|^)" + name + "(\\s|$)"))
    : false;

/**
 * 是否向当前元素添加/移除指定类名（不传 `element` 默认 `document.body`）。
 * 签名与行为对齐原包 `toggleClass`
 */
export const toggleClass = (
  bool: boolean,
  name: string,
  element?: HTMLElement | Element
): void => {
  if (!hasDocument) return;
  const target = element || document.body;
  const { className } = target;
  const replaced = className.replace(name, "").trim().split(/\s+/).join(" ");
  target.className = bool ? `${replaced} ${name}` : replaced;
};

/** 创建超链接并点击，默认 `_blank`。签名与行为对齐原包 `openLink` */
export const openLink = (href: string, target: Target = "_blank"): void => {
  if (!hasDocument) return;
  const link = document.createElement("a");
  link.setAttribute("href", href);
  link.setAttribute("target", target);
  link.setAttribute("rel", "noreferrer noopener");
  link.setAttribute("id", "external");
  const existed = document.getElementById("external");
  if (existed) document.body.removeChild(existed);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* -------------------------------------------------------------------------- */
/*                                  颜色处理                                   */
/* -------------------------------------------------------------------------- */

/** `hex` 转 `rgb` 数组（内部实现，对齐原包 `hexToRgb`） */
function hexToRgb(str: string): Array<number> {
  const colors = str.replace("#", "").match(/../g);
  const rgb: number[] = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = parseInt(colors[i], 16);
  }
  return rgb;
}

/** `rgb` 转 `hex` 字符串（内部实现，对齐原包 `rgbToHex`） */
function rgbToHex(r: number, g: number, b: number): string {
  const hexArr = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) {
    if (hexArr[i].length === 1) hexArr[i] = `0${hexArr[i]}`;
  }
  return `#${hexArr.join("")}`;
}

/** 颜色值加深，`level` 取值 0~1。签名与行为对齐原包 `darken` */
export const darken = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * (1 - level));
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/** 颜色值变浅，`level` 取值 0~1。签名与行为对齐原包 `lighten` */
export const lighten = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/* -------------------------------------------------------------------------- */
/*                                    SVG                                     */
/* -------------------------------------------------------------------------- */

/**
 * 解析 SVG 字符串，提取 `viewBox` 中的宽高及所有 `<path>` 拼接结果。
 * 签名与行为对齐原包 `getSvgInfo`（缺少 `viewBox` 时抛错，与原包一致）
 */
export function getSvgInfo(svgStr: string): SvgInfo {
  if (!hasDocument) return svgStr as unknown as SvgInfo;
  const svgElement = new DOMParser()
    .parseFromString(svgStr, "image/svg+xml")
    .querySelector("svg");
  if (!svgElement) return svgStr as unknown as SvgInfo;
  const viewBox = svgElement.getAttribute("viewBox");
  if (!viewBox)
    throw new Error("Invalid SVG string: Missing viewBox attribute.");
  const sizeArr = viewBox.split(" ");
  const width = parseInt(sizeArr[2], 10);
  const height = parseInt(sizeArr[3], 10);
  const body = Array.from(svgElement.querySelectorAll("path"))
    .map(path => path.outerHTML)
    .join(" ");
  return { width, height, body };
}

/* -------------------------------------------------------------------------- */
/*                                 剪贴板/设备                                 */
/* -------------------------------------------------------------------------- */

/**
 * 将文本复制到剪贴板（`execCommand` 方案，非安全上下文亦可回退）。
 * 签名与行为对齐原包 `copyTextToClipboard`
 */
export function copyTextToClipboard(
  input: string,
  { target }: { target?: HTMLElement } = {}
): boolean {
  const textarea = document.createElement("textarea");
  const activeElement = document.activeElement;
  textarea.value = input;
  textarea.setAttribute("readonly", "");
  textarea.style.contain = "strict";
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  textarea.style.fontSize = "12pt";
  const selection = document.getSelection();
  let range: Range | undefined;
  if (selection && selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
  }
  target?.append(textarea);
  textarea.select();
  textarea.selectionStart = 0;
  textarea.selectionEnd = input.length;
  let isSuccess = false;
  try {
    isSuccess = document.execCommand("copy");
  } catch (error: any) {
    throw new Error(error.message);
  }
  textarea.remove();
  if (range && selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
  if (activeElement instanceof HTMLElement) {
    activeElement.focus();
  }
  return isSuccess;
}

/** 检测设备类型（移动端返回 `true`）。签名与行为对齐原包 `deviceDetection` */
export const deviceDetection = (): boolean => {
  if (!hasDocument) return;
  const ua = navigator.userAgent.toLowerCase();
  const matchUa = (pattern: string): boolean =>
    new RegExp(pattern, "i").test(ua);
  return (
    matchUa("midp") ||
    matchUa("ucweb") ||
    matchUa("android") ||
    matchUa("iphone os") ||
    matchUa("windows ce") ||
    matchUa("windows mobile")
  );
};

/* -------------------------------------------------------------------------- */
/*                                  存储                                       */
/* -------------------------------------------------------------------------- */

class sessionStorageProxy implements ProxyStorage {
  protected storage: Storage;

  constructor(storageModel: Storage) {
    this.storage = storageModel;
  }

  setItem<T>(k: string, v: T): void {
    if (!isAllEmpty(this.storage)) {
      this.storage.setItem(k, JSON.stringify(v));
    }
  }

  getItem<T>(k: string): T {
    if (!isAllEmpty(this.storage)) {
      return JSON.parse(this.storage.getItem(k) as string) as T;
    }
  }

  removeItem(k: string): void {
    if (!isAllEmpty(this.storage)) {
      this.storage.removeItem(k);
    }
  }

  clear(): void {
    if (!isAllEmpty(this.storage)) {
      this.storage.clear();
    }
  }
}

class localStorageProxy extends sessionStorageProxy implements ProxyStorage {
  constructor(localStorage: Storage) {
    super(localStorage);
  }
}

/**
 * 操作本地 `localStorage`（值 JSON 序列化存取，与 `responsive-storage` 兼容）。
 * 签名与行为对齐原包 `storageLocal`
 */
export const storageLocal = (): localStorageProxy =>
  isClient
    ? new localStorageProxy(window.localStorage)
    : new localStorageProxy("" as any);

/* -------------------------------------------------------------------------- */
/*                                  数值                                       */
/* -------------------------------------------------------------------------- */

/** 求数字数组总和（空数组返回 0）。签名与行为对齐原包 `sum` */
export const sum = (list: Array<number>): number =>
  isArray(list) && list.length > 0 ? list.reduce((a, b) => a + b) : 0;

/** 字节数转可读字符串，默认保留两位。签名与行为对齐原包 `formatBytes` */
export const formatBytes = (bytes: number, decimals?: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/* -------------------------------------------------------------------------- */
/*                              Vue 组件相关                                   */
/* -------------------------------------------------------------------------- */

/**
 * 向组件中添加 `install` 方法，使其既可以使用 `app.component` 注册又可以使用
 * `app.use` 安装。签名与行为对齐原包 `withInstall`
 */
export const withInstall = <T, E extends Record<string, any>>(
  main: T,
  extra?: E
): SFCWithInstall<T> & E => {
  (main as SFCWithInstall<T>).install = (app): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component((comp as any).name, comp as any);
    }
  };
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      (main as any)[key] = value;
    }
  }
  return main as SFCWithInstall<T> & E;
};

/**
 * 获取已经注册的全局属性对象 `globalProperties`（需在 setup 上下文中调用）。
 * 签名与行为对齐原包 `useGlobal`
 */
export function useGlobal<T>(): T {
  const { appContext } = getCurrentInstance()!;
  const globalProperties = appContext.config.globalProperties;
  return globalProperties as T;
}

/* -------------------------------------------------------------------------- */
/*                                   Hooks                                     */
/* -------------------------------------------------------------------------- */

/**
 * 检测网页整体是否处于暗色（`dark`）主题，响应式（`MutationObserver` 监听节点
 * `class` 变化，行为对齐原包 `useDark`，仅消费 `isDark` 时与 `@vueuse/core`
 * 的存储驱动实现不兼容，故自行实现）。
 */
export const useDark = (options?: DarkOptions): DarkReturn => {
  const className = options?.className ?? "dark";
  const isDark = shallowRef(false);
  let observer: MutationObserver | undefined;

  const getEl = () =>
    options?.selector
      ? options.selector === "html"
        ? document.documentElement
        : document.body
      : document.documentElement;

  const updateStatus = () => {
    isDark.value = getEl().classList.contains(className);
  };

  const toggleDark = () => {
    getEl().classList.toggle(className);
  };

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (observer) {
        observer.takeRecords();
        observer.disconnect();
      }
    });
  }

  onBeforeMount(() => {
    updateStatus();
    observer = new MutationObserver(updateStatus);
    observer.observe(getEl(), { attributes: true, attributeFilter: ["class"] });
  });

  return { isDark, toggleDark };
};

/** 将 ref / 选择器字符串统一解析为元素（内部实现） */
function resolveElement(target: unknown): HTMLElement[] {
  const raw = toValue(target as any);
  if (isString(raw)) {
    return hasDocument ? Array.from(document.querySelectorAll(raw)) : [];
  }
  const el = (raw as any)?.$el ?? raw;
  return el ? [el] : [];
}

/**
 * 监听元素尺寸的变化，内置自定义防抖时长（默认 `40` 毫秒）。`immediate` 默认
 * `true`：挂载后立即用合成 entry 执行一次回调，此后每次尺寸变化经防抖后触发。
 * 支持元素 ref、CSS 选择器字符串及二者数组；组件实例销毁时自动停止监听。
 * 行为对齐原包 `useResizeObserver`（`@vueuse/core` 同名 Hook 不支持选择器
 * 字符串，故自行实现）。
 */
export function useResizeObserver(
  target:
    | Ref<HTMLElement | undefined>
    | string
    | (Ref<HTMLElement | undefined> | string)[],
  callback: ResizeObserverCallback,
  options?: UseResizeObserverOptions
): { stop: () => void; restart: () => void } {
  const { time = 40, box = "content-box", immediate = true } = options ?? {};
  let observer: ResizeObserver | null = null;
  /** `true` 表示观察回调可以执行；`immediate=true` 时首次观察回调仅用于消费初始触发 */
  let ready = !immediate;

  const debouncedCallback = debounce(
    (entries: ResizeObserverEntry[], obs: ResizeObserver) => {
      if (ready) {
        callback(entries, obs);
      } else {
        ready = true;
      }
    },
    time
  );

  const disconnect = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const resolveTargets = (): HTMLElement[] =>
    isArray(target)
      ? target.map(item => resolveElement(item)).flat()
      : resolveElement(target);

  let stopWatch: (() => void) | undefined;

  /** （重新）启动监听，常用于停止监听后重新启用监听 */
  const restart = () => {
    if (!hasDocument) return;
    disconnect();
    stopWatch?.();
    stopWatch = watch(
      computed(resolveTargets),
      (els, _old, onCleanup) => {
        if (window && els && els.length) {
          observer = new ResizeObserver(debouncedCallback);
          els.forEach(el => {
            if (el) {
              observer.observe(el, { box });
              // immediate 模式下首次手动以合成 entry 执行一次回调
              if (!ready) {
                const rect = el.getBoundingClientRect();
                const entry = {
                  target: el,
                  contentRect: rect,
                  borderBoxSize: [
                    { inlineSize: rect.width, blockSize: rect.height }
                  ],
                  contentBoxSize: [
                    { inlineSize: rect.width, blockSize: rect.height }
                  ],
                  devicePixelContentBoxSize: [
                    { inlineSize: rect.width, blockSize: rect.height }
                  ]
                } as unknown as ResizeObserverEntry;
                callback([entry], observer);
              }
            }
          });
        }
        onCleanup(disconnect);
      },
      { immediate: true, flush: "post", deep: true }
    );
  };

  nextTick(() => {
    restart();
  });

  const stop = () => {
    disconnect();
    if (stopWatch) stopWatch();
  };

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return { stop, restart };
}
