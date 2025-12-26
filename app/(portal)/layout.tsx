"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/general/AppSidebar"
import Header from "@/components/general/Header";

export default function PortalLayout({
  	children,
}: {
  	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen min-w-screen">
				<AppSidebar />

				<div className="flex-1 flex flex-col max-w-[100vw]">
					<Header />

					<main className="flex-1 bg-gray-50 py-8 px-2 sm:px-4 lg:px-8">
						<div className="max-w-7xl mx-auto space-y-6 mb-6">
							{children}
						</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	)
}