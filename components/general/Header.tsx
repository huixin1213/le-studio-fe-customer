"use client";

import React from "react";
import { PanelLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@/stores/useUser";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserNotification from '@/components/custom/UserNotification';

type HeaderProps = {
    onToggleSidebar?: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
    const { user } = useUser();

    return (
        <header className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-white sticky top-0 z-40 w-full">
            {/* Left Sidebar Toggle */}
            {onToggleSidebar ? (
                <button
                    onClick={onToggleSidebar}
                    className="flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 hover:bg-gray-100 bg-white cursor-pointer text-primary"
                >
                    <PanelLeft className="h-4 w-4" />
                </button>
            ) : (
                <SidebarTrigger className="h-7 w-7 text-primary hover:bg-gray-100 rounded-md" />
            )}

            {/* Right */}
            <div className="flex items-center space-x-2 lg:space-x-4">
                <UserNotification />

                <Link href="/settings">
                    <Button className="bg-transparent rounded-md h-8 w-8 p-0 hover:bg-gray-100 shrink-0">
                        <Settings className="h-4 w-4 text-gray-600" />
                    </Button>
                </Link>
                
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-gray-700">
                            {user?.name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div className="hidden sm:block min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
