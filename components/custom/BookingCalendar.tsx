"use client";

import React, { useEffect, useMemo, useState } from "react";
import { buildCalendar } from "@/lib/buildCalendar";
import { Calendar, ChevronLeft, ChevronRight, MapPin, User, DollarSign, Info, MessageCircle } from "lucide-react";
import { useApiStore } from "@/stores/useApi";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import moment from "moment-timezone";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import UserBooking from "@/components/custom/UserBooking";

type Booking = {
    id: number;
    booking_time: string;
    status_label: string;
    stylist?: { name: string };
    booking_services: { service: { service_item: { name: string } } }[];
    branch?: { name: string };
    booking_date: string;
    special_notes?: string;
    status: number;
};

type BookingDay = {
    date: string;
    confirmed: Booking[];
    completed: Booking[];
    cancelled: Booking[];
    [key: string]: Booking[] | string; // Index signature for TS
};

export default function BookingCalendar() {
    const apiStore = useApiStore();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [calendar, setCalendar] = useState<any[]>([]);
    const [bookingDays, setBookingDays] = useState<BookingDay[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDay, setSelectedDay] = useState<BookingDay | null>(null);
    const [openEditBookingDialog, setOpenEditBookingDialog] = useState(false);
    const [openBooking, setOpenBooking] = useState<any>(null);

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const bookingMap = useMemo(() => {
        return bookingDays.reduce((acc, d) => {
            acc[d.date] = d;
            return acc;
        }, {} as Record<string, BookingDay>);
    }, [bookingDays]);

    const prevMonth = () => {
        if (month === 1) {
            setYear((y) => y - 1);
            setMonth(12);
        } else {
            setMonth((m) => m - 1);
        }
    };

    const nextMonth = () => {
        if (month === 12) {
            setYear((y) => y + 1);
            setMonth(1);
        } else {
            setMonth((m) => m + 1);
        }
    };

    const goToToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
    };

    async function fetchBookingCalendar() {
        const formattedMonth = `${year}-${String(month).padStart(2, "0")}`;
        const res = await apiStore.crudRequest({
            endpoint: `customer/calendar?month=${formattedMonth}`,
            method: "GET",
        });

        const normalized: BookingDay[] = Object.entries(res).map(
            ([date, value]: any) => ({
                date,
                confirmed: value?.confirmed ?? [],
                completed: value?.completed ?? [],
                cancelled: value?.cancelled ?? [],
            })
        );

        setBookingDays(normalized);
    }

    useEffect(() => {
        fetchBookingCalendar();
    }, [year, month]);

    useEffect(() => {
        setCalendar(buildCalendar(year, month, []));
    }, [year, month]);

    return (
        <div className="py-6">
            <Button onClick={goToToday} className="mb-4" variant="outline">
                Today
            </Button>

            <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                    <p className="text-primary font-semibold text-base sm:text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(year, month - 1).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                        })}
                    </p>
                    <p className="text-xs text-gray-600 hidden sm:block">Your bookings and appointments</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>

                    <Button variant="outline" onClick={nextMonth}>
                        {/* Next */}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-semibold text-muted-foreground p-2"
                    >
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendar.map((week, wi) =>
                    week.map((cell: any, i: number) => {
                        if (!cell)
                        return (
                            <div
                            key={`${wi}-${i}`}
                            className="min-h-[100px] border rounded-lg opacity-40"
                            />
                        );

                        const date = `${year}-${String(month).padStart(2, "0")}-${String(
                        cell.day
                        ).padStart(2, "0")}`;

                        const dayData = bookingMap[date] ?? null;

                        return (
                        <button
                            key={`${wi}-${i}`}
                            className="h-10 sm:h-12 p-2 rounded-lg border hover:bg-accent text-left"
                            onClick={() => {
                            if (!dayData) return;
                            setSelectedDay(dayData);
                            setOpenDialog(true);
                            }}
                        >
                            <div className="text-sm font-medium mb-1">{cell.day}</div>

                            <div className="flex gap-1 flex-wrap">
                                {dayData?.confirmed?.length ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                                ) : null}
                                {dayData?.completed?.length ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                ) : null}
                                {dayData?.cancelled?.length ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                ) : null}
                            </div>
                        </button>
                        );
                    })
                )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 mb-3 text-xs text-gray-600 px-1">
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>Cancelled</span>
                </div>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl sm:max-w-2xl p-0 ">
                    <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
                        <DialogHeader className="mb-4">
                            <div className="flex items-center justify-between">
                                <div className="grow">
                                    <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl mt-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Bookings for{" "}
                                        {selectedDay
                                            ? moment(selectedDay.date).format("DD-MMM-YYYY")
                                            : ""}
                                    </DialogTitle>
                                    <DialogDescription />
                                </div>
                            </div>
                        </DialogHeader>

                        {selectedDay && (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                {["confirmed", "completed", "cancelled"].map((status) =>
                                    (selectedDay[status] as Booking[])?.length ? (
                                        <div key={status}>
                                            <div className="space-y-2">
                                                {(selectedDay[status] as Booking[]).map((b) => (
                                                    <div 
                                                        key={b.id} 
                                                        className="border rounded-lg bg-gray-50 shadow-sm p-4 md:p-6 space-y-4"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-primary" />
                                                                <h4 className="font-semibold text-primary">
                                                                    {b?.booking_services?.map((bs: any) => bs.service?.service_item?.name?.trim())
                                                                        .filter(Boolean)
                                                                        .join(", ")
                                                                    }
                                                                </h4>
                                                            </div>
                                                            <Badge>{b?.status_label}</Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-4 md:gap-y-2 text-sm text-gray-700">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center flex-wrap">
                                                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                                                    <span className="truncate">{b?.branch?.name}</span>
                                                                </div>
                                                                <div className="flex items-center flex-wrap">
                                                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                                    <span className="truncate">{moment(`${b?.booking_date} ${b?.booking_time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center flex-wrap">
                                                                    <User className="w-4 h-4 mr-2 text-primary" />
                                                                    <span className="truncate">{b?.stylist?.name}</span>
                                                                </div>
                                                                <div className="flex items-center flex-wrap">
                                                                    <DollarSign className="w-4 h-4 mr-2 text-primary" />
                                                                    <span>RM {b?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
                                                                    <div className="ml-1">
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors" />
                                                                            </TooltipTrigger>
                                                                            
                                                                            <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                                                                                <div className="min-w-[220px] max-w-[270px] p-3">
                                                                                    <div className="space-y-2">
                                                                                        <h4 className="font-semibold text-sm text-gray-900">Price Breakdown</h4>
                                                                                        <div className="space-y-1">
                                                                                            {b?.booking_services?.map((item: any, index: number) => (
                                                                                                <div className="flex justify-between text-xs" key={index}>
                                                                                                    <span className="text-gray-600">{ item.service.service_item.name }</span>
                                                                                                    <span className="text-gray-900 font-medium">RM { item.service.service_item.price }</span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                        <div className="border-t pt-2 mt-2">
                                                                                            <div className="flex justify-between text-sm font-semibold">
                                                                                                <span className="text-gray-900">Total</span>
                                                                                                <span className="text-gray-900"> RM {b?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </div>
                                                                </div>
                                                                {b?.special_notes && (
                                                                    <span className="flex items-center min-w-0 text-gray-700">
                                                                        <MessageCircle className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                                                        <span className="wrap-break-words whitespace-pre-line max-w-[180px] sm:max-w-full truncate">{b?.special_notes}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {(b.status === 0 && new Date(b.booking_date).getTime() >= new Date().setHours(0,0,0,0)) && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    className="transition-all duration-200 h-10 px-4 py-2 "
                                                                    onClick={() => {
                                                                        setOpenEditBookingDialog(true);
                                                                        setOpenBooking(b);
                                                                    }}
                                                                    variant="outline"
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null
                                )}

                                <div className="flex justify-end pt-4 gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" className="h-10 px-4 py-2">
                                            Close
                                        </Button>
                                    </DialogClose>
                                    {/* <Button 
                                        className="transition-all duration-200 h-10 px-4 py-2 bg-primary text-white hover:bg-primary/90"
                                        onClick={() => {
                                            setOpenEditBookingDialog(true);
                                            setOpenBookingDialog(false);
                                        }}
                                    >
                                        Edit
                                    </Button> */}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={openEditBookingDialog} onOpenChange={setOpenEditBookingDialog}>
                <DialogContent className="max-w-2xl sm:max-w-2xl p-0 ">
                    <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
                        <DialogHeader className="mb-4">
                            <div className="flex items-center justify-between">
                                <div className="grow">
                                    <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl mt-2">
                                        Reschedule Appointment
                                    </DialogTitle>
                                    <DialogDescription>Change your appointment location, date, time, services, or stylist.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <UserBooking booking={openBooking} type="edit" onClose={() => {setOpenBooking(null); setOpenEditBookingDialog(false); fetchBookingCalendar();}} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
