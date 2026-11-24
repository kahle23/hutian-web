/**
 * 壶天自研响应式 storage（ht-storage）
 *
 * 仅实现项目实际用到的能力：
 * - `getData`：按命名空间读取 localStorage 并反序列化，键不存在或解析失败返回 `undefined`；
 * - 默认导出插件：`app.use(Storage, { nameSpace, memory })` 时把 `memory` 中的默认值注入
 *   localStorage（键已存在则不覆盖，避免丢失用户已保存的设置），并将一个与 localStorage
 *   双向同步的深层响应式对象挂载到 `app.config.globalProperties.$storage`——任意属性修改
 *   （含新增键）都会写回 localStorage。
 * 存取格式为 JSON 序列化，与 `storageLocal()`（ht-utils）一致，对既有 `responsive-` 前缀键完全兼容。
 */
import { reactive, watch, type App } from "vue";

export interface Options {
  /** 键名前缀（取自平台配置 `ResponsiveStorageNameSpace`，如 `responsive-`） */
  nameSpace?: string;
  /** 各存储键的默认值（键名不带命名空间前缀） */
  memory?: Record<string, unknown>;
}

/** 按命名空间读取并反序列化 localStorage 值；键不存在或解析失败返回 `undefined` */
export function getData<T = any>(key: string, nameSpace = ""): T | undefined {
  try {
    const raw = localStorage.getItem(`${nameSpace}${key}`);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

/** 将默认值注入 localStorage 并挂载响应式 `$storage` 的 Vue 插件 */
function install(app: App, { nameSpace = "", memory = {} }: Options = {}) {
  const storageReactive = reactive<Record<string, any>>({});
  Object.keys(memory).forEach(key => {
    const stored = getData(key, nameSpace);
    let initial = stored;
    if (stored === undefined) {
      // 仅在键不存在时写入默认值，不覆盖用户已保存的设置
      localStorage.setItem(`${nameSpace}${key}`, JSON.stringify(memory[key]));
      initial = memory[key];
    } else if (
      stored &&
      typeof stored === "object" &&
      !Array.isArray(stored) &&
      memory[key] &&
      typeof memory[key] === "object" &&
      !Array.isArray(memory[key])
    ) {
      // 兼容早期版本存储：对象型键缺失的字段用默认值补齐（已有值不覆盖），并立即回写。
      // 项目中存在多处「整分支回写 $storage.layout = {...}」的模式，若响应式分支缺字段，
      // 回写会把 theme store 等直接写入 localStorage 的新字段覆盖丢失，故必须补齐形状
      initial = { ...(memory[key] as Record<string, unknown>), ...stored };
      localStorage.setItem(`${nameSpace}${key}`, JSON.stringify(initial));
    }
    storageReactive[key] = initial;
    // 逐键监听该分支的变更（含深层属性与新增键），**同步**写回 localStorage：
    // 项目中存在绕过 `$storage` 直接经 storageLocal 写同一键的场景（如 theme store 写
    // `responsive-layout`、multiTags store 写 `responsive-tags`），同步落盘可保证二者按
    // 真实赋值顺序生效，避免延迟批处理把直写的数据覆盖回去
    watch(
      () => storageReactive[key],
      () => {
        localStorage.setItem(
          `${nameSpace}${key}`,
          JSON.stringify(storageReactive[key])
        );
      },
      { deep: true, flush: "sync" }
    );
  });
  app.config.globalProperties.$storage = storageReactive as ResponsiveStorage;
}

export default { install, getData };
