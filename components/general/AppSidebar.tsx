"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { useUser } from "@/stores/useUser";
import { useApiStore } from "@/stores/useApi";

import {
	LayoutDashboard,
	Calendar,
	Package,
	CreditCard,
	Gift,
	Scissors
} from "lucide-react";

const menu = [
	{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ label: "Booking", href: "/booking", icon: Calendar },
	{ label: "Packages", href: "/packages", icon: Package },
	{ label: "Top Up", href: "/top-up", icon: CreditCard },
	{ label: "Vouchers", href: "/vouchers", icon: Gift },
];

export function AppSidebar() {
	const pathname = usePathname();
	const apiStore = useApiStore();
	const { logout } = useUser();

	async function handleLogout() {
		try {
			await apiStore.crudRequest({
				endpoint: "customer/logout",
				method: "POST",
			});
		} catch {}

		Cookies.remove("token");
		logout();
		window.location.href = "/login";
	}

	return (
		<Sidebar collapsible="icon" className="border-r">
			<div className="flex items-center gap-3 px-4 py-6">
				<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<Scissors className="text-white" />
				</div>
				<span className="font-bold text-lg">LE CLASSIC</span>
			</div>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menu.map(item => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href}
									>
										<Link href={item.href}>
											<item.icon className="h-4 w-4" />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<div className="p-2">
				<Button
					variant="ghost"
					className="w-full justify-start text-red-600 hover:text-red-700"
					onClick={handleLogout}
				>
					<LogOut className="h-4 w-4 mr-2" />
					Sign Out
				</Button>
			</div>
		</Sidebar>
	);
}
