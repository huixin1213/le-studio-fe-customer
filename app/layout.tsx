import type { Metadata } from "next";

import "./globals.css"; // keep Tailwind here
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Le Classic Customer",
    description: "Salon booking system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50">
                <main className="">{children}</main>
                <Toaster position="bottom-right" />
            </body>
        </html>
    );
}