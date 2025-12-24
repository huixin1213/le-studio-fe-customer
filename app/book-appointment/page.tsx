"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/stores/useUser";
import GuestBooking from "@/components/custom/GuestBooking";
import UserBooking from "@/components/custom/UserBooking";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/general/AppSidebar";
import Header from "@/components/general/Header";

export default function BookingPage() {
	const { isLoggedIn } = useUser();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return null;

	if (!isLoggedIn()) {
		return <GuestBooking />;
	}

	return (
		<SidebarProvider>
			<div className="flex min-h-screen min-w-screen">
				<AppSidebar />

				<div className="flex-1 flex flex-col">
					<Header />

					<main className="flex-1 bg-gray-50 py-8 px-2 sm:px-4 lg:px-8">
						<div className="max-w-7xl mx-auto space-y-6 mb-6">
							<UserBooking type="new" />
						</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
