<script setup lang="ts">
import { ref } from "vue";
import type { RoleItem } from "@/api/system";

const props = defineProps<{
  roleOptions?: Array<RoleItem>;
  modelValue?: Array<number>;
}>();

const roleFormRef = ref();
const selectedRoleIds = ref<Array<number>>(props.modelValue ?? []);

function getSelected() {
  return selectedRoleIds.value;
}

defineExpose({ getSelected });
</script>

<template>
  <el-form ref="roleFormRef" label-width="82px">
    <el-form-item label="分配角色">
      <el-select
        v-model="selectedRoleIds"
        multiple
        clearable
        filterable
        class="w-full"
        placeholder="请选择要分配的角色"
      >
        <el-option
          v-for="item in props.roleOptions ?? []"
          :key="item.id"
          :label="`${item.name}（${item.code}）`"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
