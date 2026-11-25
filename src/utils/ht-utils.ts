/**
 * 壶天自研工具集（ht-utils）：项目自研的通用工具集，仅保留项目实际用到的部分，
 * 个别实现细节在相应函数注释里注明。
 */

import {
  type ShallowRef,
  computed,
  getCurrentInstance,
  getCurrentScope,
  type MaybeRefOrGetter,
  nextTick,
  onBeforeMount,
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
  type Plugin,
  type Ref
} from "vue";

/* -------------------------------- 类型声明 -------------------------------- */

/** `FunctionArgs` —— debounce / throttle 的函数入参约束（内部使用） */
type FunctionArgs<Args extends any[] = any[], Return = void> = (
  ...args: Args
) => Return;

/** `Target` —— 超链接的打开方式，同 `<a>` 的 `target` */
export type Target = "_blank" | "_self" | "_parent" | "_top" | "framename";

/** `ProxyStorage` —— Storage 代理接口，`setItem` / `getItem` 的值经 JSON 序列化 */
export interface ProxyStorage {
  setItem<T>(k: string, v: T): void;
  getItem<T>(k: string): T;
  removeItem(k: string): void;
  clear(): void;
}

/** `SvgInfo` —— `getSvgInfo` 的返回：`width` / `height` 取自 `viewBox` 第三、四项，`body` 为全部 `<path>` 的 `outerHTML` */
export interface SvgInfo {
  width: number;
  height: number;
  body: string;
}

/** `DarkOptions` —— `useDark` 入参：`className` 检测的类名（默认 `dark`），`selector` 监听 `html`（默认）或 `body` */
export interface DarkOptions {
  className?: string;
  selector?: "html" | "body";
}

/** `DarkReturn` —— `useDark` 返回：`isDark` 当前是否暗色，`toggleDark` 明暗切换 */
export interface DarkReturn {
  isDark: ShallowRef<boolean>;
  toggleDark: () => void;
}

/** `UseResizeObserverOptions` —— `useResizeObserver` 入参：`time` 防抖时长（默认 40 毫秒）、`box` 观察的盒模型（默认 `content-box`）、`immediate` 挂载后是否立即回调（默认 `true`） */
export interface UseResizeObserverOptions {
  time?: number;
  box?: "content-box" | "border-box";
  immediate?: boolean;
}

/** `SFCWithInstall<T>` —— 带 `install` 方法、可直接 `app.use` 的组件 */
export type SFCWithInstall<T> = T & Plugin;

/* ------------------------------ 基础类型判断 ------------------------------ */

const toString = Object.prototype.toString;

/** `is(val, type): boolean` —— `Object.prototype.toString` 的结果是否为 `[object type]`（内部实现） */
function is(val: unknown, type: string): boolean {
  return toString.call(val) === `[object ${type}]`;
}

/** `isObject(val): boolean` —— 是否为对象（`[object Object]`） */
export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, "Object");
}

/** `isNumber(val): boolean` —— 是否为 `number` */
export function isNumber(val: unknown): val is number {
  return is(val, "Number");
}

/** `isString(val): boolean` —— 是否为 `string` */
export function isString(val: unknown): val is string {
  return is(val, "String");
}

/** `isFunction(val): boolean` —— 是否为函数 */
export function isFunction(val: unknown): val is Function {
  return typeof val === "function";
}

/** `isBoolean(val): boolean` —— 是否为 `boolean` */
export function isBoolean(val: unknown): val is boolean {
  return is(val, "Boolean");
}

/** `isArray(val): boolean` —— 是否为数组 */
export function isArray(val: any): val is Array<any> {
  return Array.isArray(val);
}

/** `isAllEmpty(val): boolean` —— 是否为空：`null` / `undefined`、空数组、空字符串、空 `Map` / `Set`、无自有键的对象均为 `true` */
export function isAllEmpty<T = unknown>(val: T): boolean {
  if (val === null || val === undefined) return true;
  if (isString(val) || Array.isArray(val)) return val.length === 0;
  if (val instanceof Map || val instanceof Set) return val.size === 0;
  return isObject(val) && Object.keys(val).length === 0;
}

/* -------------------------------- 深度对比 -------------------------------- */

/** 非 `null`、非数组的 `object`（内部实现） */
const isObjectLike = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);

/** 登记正在比较的对象对：再次命中说明成环，视为相等；比较完成后撤销登记（内部实现） */
function compareOnStack(
  a: object,
  b: object,
  seen: WeakMap<object, unknown>,
  compare: () => boolean
): boolean {
  if (seen.has(a)) return seen.get(a) === b;
  seen.set(a, b);
  const equal = compare();
  seen.delete(a);
  return equal;
}

/**
 * `isEqual(a, b): boolean` —— 深度对比：`Date`、`RegExp`、`Map`、`Set`、数组、普通对象逐项比较，
 * 基础类型与函数按引用比较，类型不同的对象恒不相等；`WeakMap` 防循环引用
 */
export function isEqual(a: unknown, b: unknown): boolean {
  return deepEqual(a, b, new WeakMap());
}

function deepEqual(
  a: unknown,
  b: unknown,
  seen: WeakMap<object, unknown>
): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp)
    return a.toString() === b.toString();
  if (a instanceof Map && b instanceof Map) {
    return compareOnStack(a, b, seen, () => {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key) || !deepEqual(value, b.get(key), seen)) return false;
      }
      return true;
    });
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return compareOnStack(a, b, seen, () => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i], seen)) return false;
      }
      return true;
    });
  }
  // 类型标签不同的对象（如 `{}` 与 `new Date()`、`Map` 与 `Set`）直接判不等，不落到按自有键比较
  if (
    isObjectLike(a) &&
    isObjectLike(b) &&
    toString.call(a) === toString.call(b)
  ) {
    return compareOnStack(a, b, seen, () => {
      const keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) return false;
      return keys.every(
        key =>
          Object.prototype.hasOwnProperty.call(b, key) &&
          deepEqual(a[key], b[key], seen)
      );
    });
  }
  return false;
}

/* ------------------------------- 防抖/节流 -------------------------------- */

/** `delay(timeout = 20): Promise<unknown>` —— 延迟 `timeout` 毫秒后 resolve */
export const delay = (timeout = 20): Promise<unknown> =>
  new Promise(resolve => setTimeout(resolve, timeout));

/** `debounce(fn, timeout = 200, immediate = false): () => void` —— 防抖：每次调用重置计时器，`timeout` 毫秒内无新调用才执行；`immediate` 为 `true` 时首次立即执行、其后 `timeout` 毫秒内的调用丢弃；返回的函数透传 `this` 与参数 */
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

/** `throttle(fn, timeout = 1000): () => void` —— 节流：调用后延迟 `timeout` 毫秒执行一次，执行前的新调用直接丢弃（不补发）；返回的函数透传 `this` 与参数 */
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

/* --------------------------------- 深拷贝 --------------------------------- */

/** `cloneDeep(val): any` —— 深拷贝；支持对象（保留原型）、数组、`Date`、`RegExp`、`Set`、`Map`、类数组，其余类型原样返回 */
export function cloneDeep(val: any): any {
  if (!val) return val;
  switch (toString.call(val)) {
    case "[object Object]": {
      const ret = Object.create(Object.getPrototypeOf(val));
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          ret[key] = cloneDeep(val[key]);
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
      // 借用数组的 forEach：类数组（如 Arguments）自身没有该方法
      Array.prototype.forEach.call(val, (item: any) =>
        ret.push(cloneDeep(item))
      );
      return ret;
    }
    case "[object Set]": {
      const ret = new val.constructor();
      val.forEach((item: any) => ret.add(cloneDeep(item)));
      return ret;
    }
    case "[object Map]": {
      const ret = new val.constructor();
      val.forEach((item: any, key: any) => ret.set(key, cloneDeep(item)));
      return ret;
    }
    default:
      return val;
  }
}

/* ------------------------------- 字符串截取 ------------------------------- */

/** `subBefore(val, character): string` —— 截取首个 `character` 之前的部分；`character` 不是字符串或找不到时返回空串 */
export function subBefore(val: string, character: string): string {
  return isString(character) ? val.substring(0, val.indexOf(character)) : "";
}

/** `subAfter(val, character): string` —— 截取最后一个 `character` 之后的部分；找不到时返回整串，`character` 不是字符串时返回空串 */
export function subAfter(val: string, character: string): string {
  return isString(character)
    ? val.substring(val.lastIndexOf(character) + character.length)
    : "";
}

/* ---------------------------------- 正则 ---------------------------------- */

/** 链接正则 */
const urlReg = new RegExp(
  "^(?:(https?|ftp|rtsp|mms|ws|wss)://)?(?:\\S+(?::\\S*)?@)?(?:(?:localhost)|(?:[1-9]\\d{0,2}(?:\\.\\d{1,3}){3})|(?:\\[[0-9a-fA-F:]+\\])|(?:(?:[a-zA-Z0-9-_]+\\.)+[a-zA-Z]{2,63}))(?::\\d{1,5})?(?:[/?#]\\S*)?$",
  "i"
);

/** `isUrl(value): boolean` —— 是否为合法链接（协议、主机、端口、路径整体校验，协议可省略） */
export function isUrl(value: string): boolean {
  return urlReg.test(value);
}

/* ---------------------------------- 数组 ---------------------------------- */

/** `isIncludeAllChildren(c, m): boolean` —— 子体数组 `c` 的每个元素是否都在母体数组 `m` 中（严格相等） */
export function isIncludeAllChildren(
  c: Array<string | number | unknown>,
  m: Array<unknown>
): boolean {
  return c.every(item => m.some(other => other === item));
}

/** `intersection(...rest): any[]` —— 多个数组的基本类型交集；只传一个数组时原样返回该数组 */
export const intersection = (...rest: any[]): any[] =>
  rest.reduce((a, b) => a.filter(item => b.includes(item)));

/** `getKeyList(arr, key, duplicates = true): any[]` —— 取对象数组各项的 `key` 值组成新数组，跳过 `null` / `undefined`；`duplicates` 为 `true` 时去重 */
export function getKeyList(arr: any, key: string, duplicates = true): any[] {
  const list: any[] = [];
  for (const item of arr) {
    if (item[key] !== undefined && item[key] !== null) list.push(item[key]);
  }
  return duplicates ? Array.from(new Set(list)) : list;
}

/* ---------------------------------- DOM ----------------------------------- */

const hasDocument = typeof document !== "undefined";

/** `hasClass(element, name): boolean` —— 元素是否含有类名 `name`（按完整类名匹配，避免误判同名前缀的类） */
export const hasClass = (
  element: HTMLElement | Element,
  name: string
): boolean => !!element?.classList.contains(name);

/** `toggleClass(bool, name, element = document.body): void` —— `bool` 为 `true` 给元素加类名 `name`，否则移除，按完整类名匹配；不传 `element` 时作用于 `document.body` */
export const toggleClass = (
  bool: boolean,
  name: string,
  element?: HTMLElement | Element
): void => {
  if (!hasDocument) return;
  (element || document.body).classList.toggle(name, bool);
};

/** `openLink(href, target = "_blank"): void` —— 创建 `<a>` 并触发点击以打开链接，自带 `rel="noreferrer noopener"` */
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

/* -------------------------------- 颜色处理 -------------------------------- */

/** `hexToRgb(str): number[]` —— `#rrggbb` 转为 `[r, g, b]`（内部实现） */
function hexToRgb(str: string): Array<number> {
  const colors = str.replace("#", "").match(/../g);
  const rgb: number[] = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = parseInt(colors[i], 16);
  }
  return rgb;
}

/** `rgbToHex(r, g, b): string` —— `[r, g, b]` 转为 `#rrggbb`，个位补零（内部实现） */
function rgbToHex(r: number, g: number, b: number): string {
  const hexArr = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) {
    if (hexArr[i].length === 1) hexArr[i] = `0${hexArr[i]}`;
  }
  return `#${hexArr.join("")}`;
}

/** `darken(color, level): string` —— 加深 `hex` 颜色，`level` 取 0~1，逐通道 `Math.floor(v * (1 - level))` */
export const darken = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * (1 - level));
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/** `lighten(color, level): string` —— 变浅 `hex` 颜色，`level` 取 0~1，逐通道 `Math.floor((255 - v) * level + v)` */
export const lighten = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/* ---------------------------------- SVG ----------------------------------- */

/** `getSvgInfo(svgStr): SvgInfo` —— 解析 SVG 字符串，取 `viewBox` 的宽高与全部 `<path>`；解析不出 `<svg>` 时原样返回入参，缺 `viewBox` 时抛错 */
export function getSvgInfo(svgStr: string): SvgInfo {
  const svgElement = hasDocument
    ? new DOMParser()
        .parseFromString(svgStr, "image/svg+xml")
        .querySelector("svg")
    : null;
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

/* ------------------------------ 剪贴板/设备 ------------------------------- */

/**
 * `copyTextToClipboard(input, { target = document.body }): boolean` —— 借临时 `textarea` 调 `execCommand("copy")`
 * 复制文本，结束后还原选区与焦点；返回是否复制成功
 */
export function copyTextToClipboard(
  input: string,
  { target = document.body }: { target?: HTMLElement } = {}
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
  target.append(textarea);
  textarea.select();
  textarea.selectionStart = 0;
  textarea.selectionEnd = input.length;
  const isSuccess = document.execCommand("copy");
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

/** 移动端 UA 特征（7 条规则） */
const mobileUaReg =
  /midp|ucweb|android|iphone os|windows ce|rv:1.2.3.4|windows mobile/i;

/** `deviceDetection(): boolean` —— 是否为移动端设备（按 UA 判断） */
export const deviceDetection = (): boolean =>
  hasDocument ? mobileUaReg.test(navigator.userAgent) : false;

/* ---------------------------------- 存储 ---------------------------------- */

/** `Storage` 代理：值统一经 JSON 序列化存取，与 `ht-storage` 的存取格式一致（内部实现） */
class LocalStorageProxy implements ProxyStorage {
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

/** `storageLocal(): LocalStorageProxy` —— `localStorage` 代理，值经 JSON 序列化存取；无 `window` 时以空串兜底，读写均为空操作 */
export const storageLocal = (): LocalStorageProxy =>
  typeof window === "undefined"
    ? new LocalStorageProxy("" as any)
    : new LocalStorageProxy(window.localStorage);

/* ---------------------------------- 数值 ---------------------------------- */

/** `sum(list): number` —— 数字数组求和；非数组或空数组返回 `0` */
export const sum = (list: Array<number>): number =>
  isArray(list) && list.length > 0 ? list.reduce((a, b) => a + b) : 0;

/** `formatBytes(bytes, decimals = 2): string` —— 字节数转为带单位的可读字符串，保留 `decimals` 位小数（传 `0` 按 `2` 处理） */
export const formatBytes = (bytes: number, decimals?: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/* ------------------------------ Vue 组件相关 ------------------------------ */

/** `withInstall(main): SFCWithInstall<T>` —— 给组件挂上 `install`，供 `app.use` 时按组件 `name` 全局注册 */
export const withInstall = <T>(main: T): SFCWithInstall<T> => {
  (main as SFCWithInstall<T>).install = app =>
    app.component((main as { name: string }).name, main as any);
  return main as SFCWithInstall<T>;
};

/** `useGlobal<T>(): T` —— 取当前实例所属应用的 `globalProperties`（需在 `setup` 内调用） */
export function useGlobal<T>(): T {
  return getCurrentInstance()!.appContext.config.globalProperties as T;
}

/* --------------------------------- Hooks ---------------------------------- */

/**
 * `useDark(options?): DarkReturn` —— 响应式暗色主题：`MutationObserver` 监听 `html`（或 `body`）的 `class`
 * 变化刷新 `isDark`，`toggleDark()` 切换类名；作用域销毁时自动停止监听
 */
export const useDark = (options?: DarkOptions): DarkReturn => {
  const className = options?.className ?? "dark";
  const el =
    options?.selector === "body" ? document.body : document.documentElement;
  const isDark = shallowRef(false);
  let observer: MutationObserver | undefined;

  /** 同步一次当前主题状态 */
  const updateStatus = () => (isDark.value = el.classList.contains(className));

  onBeforeMount(() => {
    updateStatus();
    observer = new MutationObserver(updateStatus);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  if (getCurrentScope()) {
    onScopeDispose(() => observer?.disconnect());
  }

  return { isDark, toggleDark: () => el.classList.toggle(className) };
};

/** 将 ref / getter / 组件实例 / CSS 选择器解析为元素数组，解析不到时为空数组（内部实现） */
function resolveElement(target: unknown): HTMLElement[] {
  const raw = toValue(target as MaybeRefOrGetter<unknown>);
  if (isString(raw)) {
    return hasDocument ? Array.from(document.querySelectorAll(raw)) : [];
  }
  // 组件实例取其根元素 `$el`，其余（元素本身等）原样使用
  const instance = raw as { $el?: HTMLElement } | null | undefined;
  const el = (instance?.$el ?? raw) as HTMLElement | undefined;
  return el ? [el] : [];
}

/**
 * `useResizeObserver(target, callback, options?): { stop, restart }` —— 监听元素尺寸变化，回调经防抖触发（默认 40 毫秒）。
 * `target` 支持元素 ref、CSS 选择器字符串及二者数组；`options.immediate`（默认 `true`）时挂载后立即以合成 entry
 * 回调一次，并吞掉 `observe()` 自带的首帧通知。作用域销毁自动 `stop`，`restart` 用于停止后重新启用。
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
  let stopWatch: (() => void) | undefined;
  /** 作用域已销毁：拦住排在 `nextTick` 里的首次 `restart`，避免建出无人清理的观察器 */
  let disposed = false;

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

  /** （重新）启动监听，常用于停止监听后重新启用监听 */
  const restart = () => {
    if (!hasDocument) return;
    disconnect();
    stopWatch?.();
    stopWatch = watch(
      computed(resolveTargets),
      (els, _old, onCleanup) => {
        if (els.length) {
          observer = new ResizeObserver(debouncedCallback);
          els.forEach(el => {
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
          });
        }
        onCleanup(disconnect);
      },
      { immediate: true, flush: "post" }
    );
  };

  nextTick(() => {
    if (!disposed) restart();
  });

  const stop = () => {
    disconnect();
    stopWatch?.();
  };

  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true;
      stop();
    });
  }

  return { stop, restart };
}
