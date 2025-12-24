"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/stores/useUser";
import GuestBooking from "@/components/custom/GuestBooking";

export default function Home() {
	const { isLoggedIn } = useUser();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return null;

	if (isLoggedIn()) {
		window.location.href = "/dashboard";
	} else {
		window.location.href = "/login";
	}

	return (
		<div></div>
	);
}
