// /stores/useApi.ts
import { create } from "zustand";
import Cookies from "js-cookie";
import { useUser } from "@/stores/useUser";

const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://xxx.com/api/";

interface CrudRequestParams {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: Record<string, any> | FormData | null;
    isFormData?: boolean;
    raw?: boolean;
    authRequired?: boolean;
}

interface ApiStore {
    apiUrl: string;
    crudRequest: (params: CrudRequestParams) => Promise<any>;
}

export const useApiStore = create<ApiStore>(() => ({
    apiUrl: API_URL,

    async crudRequest({
        endpoint,
        method,
        body = null,
        isFormData = false,
        raw = false,
        authRequired = true,
    }) {
        const headers: Record<string, string> = {};

        // -----------------------
        // AUTH HEADER
        // -----------------------
        if (authRequired) {
            const stored = localStorage.getItem("customer-user-storage");

            if (!stored) {
                window.location.href = "/login";
                return;
            }

            try {
                const parsed = JSON.parse(stored);
                const token = parsed.state.token;

                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }
            } catch {
                window.location.href = "/login";
                return;
            }
        }

        if (!isFormData) {
            headers["Content-Type"] = "application/json";
        }

        try {
            const res = await fetch(API_URL + endpoint, {
                method,
                headers,
                body: isFormData
                    ? (body as FormData)
                    : body
                    ? JSON.stringify(body)
                    : null,
            });

            // -----------------------
            // 401 → logout
            // -----------------------
            if (res.status === 401) {
                Cookies.remove("token");
                useUser.getState().logout();
                window.location.href = "/login";
                throw new Error("Unauthorized");
            }

            // -----------------------
            // other errors
            // -----------------------
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Request failed");
            }

            if (raw) return res;

            return await res.json();
        } catch (error: any) {
            throw new Error(error.message || "Network error");
        }
    },
}));
