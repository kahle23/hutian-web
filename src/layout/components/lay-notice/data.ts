export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "primary" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
  emptyText: string;
}

/** 壶天：通知面板数据位（当前无站内消息源，待接入后端消息接口后填充） */
export const noticesData: TabItem[] = [
  {
    key: "1",
    name: "通知",
    list: [],
    emptyText: "暂无通知"
  },
  {
    key: "2",
    name: "消息",
    list: [],
    emptyText: "暂无消息"
  },
  {
    key: "3",
    name: "待办",
    list: [],
    emptyText: "暂无待办"
  }
];
