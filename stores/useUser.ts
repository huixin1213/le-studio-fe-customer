"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Customer = {
    id: number;
    name: string;
    email?: string | null;
    mobile_no?: string;
};

type CustomerState = {
    user: Customer | null;
    token: string | null;

    setUser: (user: Customer | null, token: string | null) => void;
    logout: () => void;

    isLoggedIn: () => boolean;
};

export const useUser = create<CustomerState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            setUser: (user, token) => set({ user, token }),

            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem("customer-user-storage");
            },

            isLoggedIn: () => {
                return !!get().token;
            },
        }),
        {
            name: "customer-user-storage",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
        }
    )
);
