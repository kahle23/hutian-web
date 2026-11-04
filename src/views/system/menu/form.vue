<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    parentId: 0,
    higherMenuOptions: [],
    name: "",
    type: 1,
    description: "",
    icon: "",
    route: "",
    component: "",
    permission: "",
    sort: 1,
    enabled: 1,
    showFlag: 1
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const typeOptions = [
  { label: "目录", value: 1 },
  { label: "菜单", value: 2 },
  { label: "按钮", value: 3 }
];

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="newFormInline.type">
            <el-radio-button
              v-for="item in typeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="newFormInline.parentId"
            class="w-full"
            :data="newFormInline.higherMenuOptions"
            :props="{
              value: 'id',
              label: 'name',
              children: 'children'
            }"
            node-key="id"
            check-strictly
            clearable
            filterable
            default-expand-all
            placeholder="不选则为顶级菜单"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入菜单名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单图标">
          <el-input
            v-model="newFormInline.icon"
            clearable
            placeholder="图标短名，如 setting / user"
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.type !== 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="路由地址" prop="route">
          <el-input
            v-model="newFormInline.route"
            clearable
            placeholder="路由段，如 user（子级相对父级拼接）"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.type === 2" :value="12" :xs="24" :sm="24">
        <el-form-item label="组件路径">
          <el-input
            v-model="newFormInline.component"
            clearable
            placeholder="如 system/user/index"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="权限标识">
          <el-input
            v-model="newFormInline.permission"
            clearable
            placeholder="如 system:user:add"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="newFormInline.sort"
            class="w-full!"
            :min="1"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="是否启用">
          <el-switch
            v-model="newFormInline.enabled"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
            inline-prompt
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.type !== 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="是否显示">
          <el-switch
            v-model="newFormInline.showFlag"
            :active-value="1"
            :inactive-value="0"
            active-text="显示"
            inactive-text="隐藏"
            inline-prompt
          />
        </el-form-item>
      </re-col>

      <re-col :span="24">
        <el-form-item label="描述">
          <el-input
            v-model="newFormInline.description"
            type="textarea"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
