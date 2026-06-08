import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  useCases?: string[];
}

export const login = async (payload: LoginPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await apiClient.post("/auth/login", payload)) as any;
  if (res.data?.token) localStorage.setItem("aiva_token", res.data.token);
  return res;
};

export const register = async (payload: RegisterPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await apiClient.post("/auth/register", payload)) as any;
  if (res.data?.token) localStorage.setItem("aiva_token", res.data.token);
  return res;
};

export const logout = () => {
  localStorage.removeItem("aiva_token");
  window.location.href = "/login";
};

export const getMe = () => apiClient.get("/auth/me");

export const updateMe = (payload: { name?: string; avatar?: string }) =>
  apiClient.put("/auth/me", payload);

export const changePassword = (payload: {
  currentPassword: string;
  newPassword: string;
}) => apiClient.put("/auth/password", payload);

/**
 * 비밀번호 재설정 이메일 발송.
 * 보안상 이메일 존재 여부와 무관하게 항상 성공 응답을 반환합니다 (이메일 열거 공격 방지).
 */
export const forgotPassword = (email: string) =>
  apiClient.post("/auth/forgot-password", { email });

/**
 * 이메일 링크의 token + 새 비밀번호로 비밀번호 재설정.
 */
export const resetPassword = (payload: {
  token: string;
  newPassword: string;
}) => apiClient.post("/auth/reset-password", payload);
