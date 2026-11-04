export type FormItemProps = {
  parentId: number;
  higherMenuOptions: Array<any>;
  name: string;
  type: number;
  description: string;
  icon: string;
  route: string;
  component: string;
  permission: string;
  sort: number;
  enabled: number;
  showFlag: number;
};

export interface FormProps {
  formInline: FormItemProps;
}
