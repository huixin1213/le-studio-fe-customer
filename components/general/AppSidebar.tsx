"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
	SidebarHeader,
	useSidebar
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

export function AppSidebar() {
	const router = useRouter();
	const pathname = usePathname();
	const apiStore = useApiStore();
	const { logout } = useUser();
	const { setOpenMobile, isMobile } = useSidebar();
	const menu = [
		{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
		{ label: "Booking", href: "/booking", icon: Calendar },
		{ label: "Packages", href: "/packages", icon: Package },
		{ label: "Top Up", href: "/top-up", icon: CreditCard },
		{ label: "Vouchers", href: "/vouchers", icon: Gift },
	];

	async function handleLogout() {
		try {
			await apiStore.crudRequest({
				endpoint: "customer/logout",
				method: "POST",
			});
		} catch {}

		Cookies.remove("token");
		logout();
		router.push("/login");
	}

	return (
		<Sidebar collapsible="icon" className="border-r group">
			<SidebarHeader>
				<div className="flex items-center justify-between px-1 py-3">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
							<Scissors className="h-4 w-4 text-white" />
						</div>
						<div className="group-data-[collapsible=icon]:hidden">
							<h2 className="text-lg font-bold text-gray-900">LE CLASSIC</h2>
						</div>
					</div>
				</div>
			</SidebarHeader>
			{/* <div className="flex items-center gap-3 px-4 py-6 transition-all group-data-[collapsible=icon]:justify-center">
				<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<Scissors className="text-white" />
				</div>
				<span className="font-bold text-lg transition-opacity group-data-[collapsible=icon]:hidden">LE CLASSIC</span>
			</div> */}

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
										<Link 
											href={item.href}
											onClick={() => {
												if (isMobile) {
													setOpenMobile(false);
												}
											}}
										>
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
					<span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
				</Button>
			</div>
		</Sidebar>
	);
}
