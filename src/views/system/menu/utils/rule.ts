import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 菜单表单校验规则 */
const formRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  route: [{ required: true, message: "请输入路由地址", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }]
});

export { formRules };
