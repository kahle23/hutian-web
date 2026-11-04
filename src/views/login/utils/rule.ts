import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 密码规则（壶天后端为 6-18 位任意字符，复杂度由后端校验） */
export const REGEXP_PWD = /^.{6,18}$/;

/** 登录校验 */
const loginRules = reactive<FormRules>({
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入密码"));
        } else if (!REGEXP_PWD.test(value)) {
          callback(new Error("密码长度应为6-18位"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

export { loginRules };
