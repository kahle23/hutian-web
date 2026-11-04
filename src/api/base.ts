import { http } from "@/utils/http";

export type PingResult = {
  name: string;
  desc: string;
  profile: Array<string>;
  time: string;
};

/** 健康检查：GET /base/ping（http 层已解包 Result.data） */
export const pingApi = () => {
  return http.request<PingResult>("get", "/base/ping");
};
