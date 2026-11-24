# THIRD_PARTY_NOTICES（第三方出处集中归档）

本项目早期基于以下第三方项目**参考复写**部分框架层代码，现已成为项目自有代码。
本文件是全仓库唯一集中记录这些出处的地方。

| 出处                    | 版本       | 许可证 | 复写产物（现为自有代码）                                              |
| ----------------------- | ---------- | ------ | --------------------------------------------------------------------- |
| vue-pure-admin 模板     | 模板期参考 | MIT    | 布局/路由/存储等框架层骨架（已大量改造，命名已迁移至 `Ht*` / `ht-*`） |
| @pureadmin/utils        | 2.6.2      | MIT    | `src/utils/ht-utils.ts`（仅保留项目实际用到的部分）                   |
| @pureadmin/table        | 3.3.0      | MIT    | `src/components/HTable/`                                              |
| @pureadmin/descriptions | 1.2.1      | MIT    | 描述列表组件签名参考（相关依赖已卸载）                                |

## 对齐声明

- `src/components/HTable/`、`src/utils/ht-utils.ts` 等的**签名与行为对齐上表所列参考实现**，
  个别已知缺陷做了修正，差异在相应函数注释里注明。
- 参考实现的原始类型声明存档于 `docs/vendor-ref/`（`table-types/`、`descriptions-types/`、
  `pureadmin-utils.d.mts` 等），仅供对照，不参与构建。
- 以上第三方项目均已在本仓库依赖中卸载（见 `package.json`）；复写产物不再依赖其运行时。

## 相关 npm 生态

以下曾用的 pure-admin 生态包均已卸载、由项目内自研实现接管：

- `@pureadmin/utils` → `src/utils/ht-utils.ts`
- `@pureadmin/table` → `src/components/HTable/`
- `@pureadmin/descriptions` → 无自研替代（项目未再使用）
- `@pureadmin/components` → 未引入过 / 已移除
- `responsive-storage` → `src/utils/ht-storage.ts`
