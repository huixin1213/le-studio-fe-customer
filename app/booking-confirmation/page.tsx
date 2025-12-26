"use client";

import { Button } from "@/components/ui/button";
import { CircleCheckBig, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function GuestBooking() {
    const email = Cookies.get("guest-email");

    return (
        <>
            <header className="flex items-center justify-between px-4 lg:px-6 border-b h-14 border-gray-200 bg-white sticky top-0 z-40 w-full">
                {/* Right */}
                <div className="flex items-center space-x-2 lg:space-x-4">
                    <Link href="/login">
                        <Button className="shrink-0">
                            Login
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CircleCheckBig className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600">Your appointment has been successfully booked</p>
                </div>
                {email && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
                        <div className="flex flex-col space-y-1.5 p-6 pb-4">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-primary">
                                <Mail className="h-5 w-5" />
                                Confirmation Email
                            </h3>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800 text-sm leading-relaxed">A confirmation email with your complete booking details has been sent to <span className="font-semibold">{email}</span>. Please check your inbox and spam folder for the confirmation email.</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
                    <div className="flex flex-col space-y-1.5 p-6 pb-4">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-primary">
                            <Calendar className="h-5 w-5" />
                            What's Next?
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                                <p>Arrive 10 minutes early for your appointment</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                                <p>Contact the salon if you need to reschedule or cancel</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
