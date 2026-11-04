export type FormItemProps = {
  account: string;
  password: string;
  name: string;
  enabled: number;
};

export interface FormProps {
  formInline: FormItemProps;
}
