export type FormItemProps = {
  name: string;
  code: string;
  description: string;
  enabled: number;
};

export interface FormProps {
  formInline: FormItemProps;
}
