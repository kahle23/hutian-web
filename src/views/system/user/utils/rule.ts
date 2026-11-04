import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 登录账号规则：字母开头的 3-20 位字母/数字/下划线 */
export const REGEXP_ACCOUNT = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;

/** 用户表单校验规则 */
const formRules = reactive<FormRules>({
  account: [
    { required: true, message: "请输入登录账号", trigger: "blur" },
    {
      pattern: REGEXP_ACCOUNT,
      message: "字母开头，3-20 位字母/数字/下划线",
      trigger: "blur"
    }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 18, message: "密码长度应为6-18位", trigger: "blur" }
  ],
  name: [{ required: true, message: "请输入用户姓名", trigger: "blur" }]
});

export { formRules };
