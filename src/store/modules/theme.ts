import { defineStore } from "pinia";
import {
  store,
  getConfig,
  storageLocal,
  responsiveStorageNameSpace
} from "../utils";

export const useThemeStore = defineStore("ht-theme", {
  state: () => ({
    primaryColor:
      storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      )?.primaryColor ?? getConfig().EpThemeColor,
    theme:
      storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      )?.theme ?? getConfig().Theme
  }),
  getters: {
    getPrimaryColor(state) {
      return state.primaryColor;
    },
    /** 用于mix导航模式下hamburger-svg的fill属性 */
    fill(state) {
      if (state.theme === "light") {
        return "#0d9488";
      } else {
        return "#fff";
      }
    }
  },
  actions: {
    setPrimaryColor(newColor: string): void {
      const layout = storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      );
      this.theme = layout?.theme;
      this.primaryColor = newColor;
      if (!layout) return;
      layout.primaryColor = newColor;
      storageLocal().setItem(`${responsiveStorageNameSpace()}layout`, layout);
    }
  }
});

export function useThemeStoreHook() {
  return useThemeStore(store);
}
