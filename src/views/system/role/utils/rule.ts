import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 角色表单校验规则 */
const formRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色标识", trigger: "blur" }]
});

export { formRules };
