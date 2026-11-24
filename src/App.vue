<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <HtDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import { HtDialog } from "@/components/HtDialog";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    HtDialog
  },
  computed: {
    currentLocale() {
      return zhCn;
    }
  }
});
</script>
