import { apiFetch } from "@/modules/core/lib/api-client";

export async function logoutApi() {
  return apiFetch<object>("/Auth/logout", {
    method: "POST",
  });
}
