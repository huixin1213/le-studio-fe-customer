"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import PageTitle from "@/components/custom/PageTitle";
import { CircleAlert, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhoneInput } from '@/components/custom/PhoneInput';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = {
    mobile_no: string | null;
    name: string | null;
    booking_date: string | null;
    booking_time: string | null;
    branches_id: string | null;
    services: string[];
    special_notes: string | null;
    stylist_id: string | null;
};

export default function GuestBooking() {
    const apiStore = useApiStore();
    const [formData, setFormData] = useState<FormData>({
        mobile_no: null,
        name: null,
        booking_date: null,
        booking_time: null,
        branches_id: null,
        services: [],
        special_notes: null,
        stylist_id: null,
    });
    
    return (
        <>
            <PageTitle title="Book Your Appointments" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                    <Card className="p-0 rounded-lg">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                            <h3 className="font-semibold tracking-tight text-salon-primary text-base sm:text-lg">Your Information</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">We need your details to confirm the booking</p>
                        </div>
                        <div className="p-6 pt-0 space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number *</Label>
                                    <div className="relative">
                                        <PhoneInput className="bg-white" value={formData.mobile_no ?? ""} onChange={(value) => setFormData((prev) => ({ ...prev, mobile_no: value }))} required />
                                    </div>
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input type="email" placeholder="your@email.com" value="" />
                                </div>
                                <div>
                                    <Label>Full Name *</Label>
                                    <Input placeholder="Your name" value="" />
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-0"></Card>
                </div>
                <div className="lg:col-span-4 hidden lg:block">
                    <div className="sticky top-4">
                        <div className="rounded-lg bg-card text-card-foreground border border-gray-200 shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                                <h3 className="font-semibold tracking-tight text-primary text-base sm:text-lg">Booking Summary</h3>
                            </div>
                            <div className="p-6 pt-0 space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <CircleAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-red-800">Please select:</p>
                                            <p className="text-xs text-red-700 wrap-break-words">Service, Branch, Stylist, Date, Time, Your Name, Your Email, Your Phone Number</p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="text-white hover:bg-primary/90 transition-all duration-200 h-11 rounded-md px-8 w-full text-sm sm:text-base min-h-11 bg-gray-400 cursor-not-allowed">
                                    <CircleCheckBig className="h-4 w-4 mr-2" />
                                    Confirm Booking
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
