"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { useUser } from "@/stores/useUser";
import Link from "next/link";
import { Calendar, History, Package, Clock, MapPin, User, DollarSign, Info, MessageCircle, Star, Eye, Zap, BookOpen, Receipt, Download } from 'lucide-react';
import { toast } from "sonner";
import PageTitle from "@/components/custom/PageTitle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import moment from "moment-timezone";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import UserBooking from "@/components/custom/UserBooking";
import BookingCalendar from "@/components/custom/BookingCalendar";
import UserReceipt from "@/components/custom/UserReceipt";

export default function DashboardPage() {
    const { user } = useUser();
    const apiStore = useApiStore();
    const [bookingList, setBookingList] = useState<any[]>([]);
    const [packageList, setPackageList] = useState<any[]>([]);
    const [openBookingDialog, setOpenBookingDialog] = useState(false);
    const [openEditBookingDialog, setOpenEditBookingDialog] = useState(false);
    const [openBooking, setOpenBooking] = useState<any>(null);
    const [openPackageDialog, setOpenPackageDialog] = useState(false);
    const [packageDetails, setPackageDetails] = useState<any>(null);
    const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
    const [openReceipt, setOpenReceipt] = useState<any>(null);

    async function fetchData() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/dashboard`,
                method: "GET",
            });

            setBookingList(data.upcoming_bookings);
            setPackageList(data.active_packages);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchPackageDetails(id: number) {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/package/${id}`,
                method: "GET",
            });

            if (data.message) {
                toast(data.message);
            } else {
                setPackageDetails(data);
            }

            console.log(data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function getTransaction(id: any) {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/transaction/${id}`,
                method: "GET",
            });

            if (data.message) {
                toast(data.message);
            } else {
                setOpenReceipt(data);
                setOpenReceiptDialog(true);
            }
        } catch (err: any) {
            // console.log(err)
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <PageTitle title={`Welcome back, ${user?.name ?? ""}!`} caption="Manage your appointments and packages" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="block md:hidden">
                    <div className="rounded-lg text-card-foreground shadow-sm border-0 bg-white">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary p-2 rounded-lg">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <h3 className="font-semibold tracking-tight text-lg text-gray-900">Quick Actions</h3>
                            </div>
                        </div>
                        <div className="p-4 space-y-6">
                            <Link className="block" href="/booking">
                                <Button className="text-white duration-200 px-4 py-2 w-full bg-primary hover:bg-gray-600 h-12 transition-colors">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book New Appointment
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 space-y-6">
                    <div className="rounded-lg text-card-foreground shadow-sm border-0 bg-white">
                        <Tabs defaultValue="appointments" className="w-full space-y-1.5 p-6 pb-2">
                            <TabsList>
                                <TabsTrigger value="appointments">
                                    <History />
                                    <span>Appointments</span>
                                </TabsTrigger>
                                <TabsTrigger value="calendar">
                                    <Calendar />
                                    <span>Calendar</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="appointments">
                                <div className="py-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-500 p-2 rounded-lg">
                                                    <History className="h-4 w-4 text-white" />
                                                </div>
                                                <h3 className="font-semibold tracking-tight text-lg text-gray-900">Upcoming Appointments</h3>
                                            </div>
                                            <Link href="/booking">
                                                <Button variant={"outline"} className="h-9 rounded-md px-3 text-xs">View All</Button>
                                            </Link>
                                        </div>

                                        <ScrollArea className="h-72 w-full mt-6">
                                            <div className="space-y-3">
                                                {bookingList && (
                                                    bookingList.map((item, index) => (    
                                                        <div 
                                                            className="p-3 bg-gray-50 rounded-lg border border-gray-50 hover:border-primary/40 shadow-sm transition-all flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 cursor-pointer max-w-full min-w-0"
                                                            onClick={() => {
                                                                setOpenBookingDialog(true);
                                                                setOpenBooking(item);
                                                            }}
                                                            key={index}
                                                        >
                                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                                <h4 className="font-semibold text-gray-900 text-base sm:text-sm line-clamp-1">
                                                                    {item.booking_services
                                                                        .map((bs: any) => bs.service?.service_item?.name?.trim())
                                                                        .filter(Boolean)
                                                                        .join(", ")
                                                                    }
                                                                </h4>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-2 text-xs sm:text-sm text-gray-500">
                                                                    <span className="flex items-center min-w-0">
                                                                        <MapPin className="h-3 w-3 shrink-0 mr-1" />
                                                                        <span className="truncate">{item.branch?.name}</span>
                                                                    </span>
                                                                    <span className="hidden sm:inline">•</span>
                                                                    <span className="flex items-center min-w-0">
                                                                        <User className="w-3 h-3 shrink-0 text-gray-900 mr-1" />
                                                                        <span className="truncate">{item.stylist?.name}</span>
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                                                    <Clock className="h-3 w-3 shrink-0" />
                                                                    <span className="truncate">
                                                                        {moment(`${item.booking_date} ${item.booking_time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-end mt-2 sm:mt-0">
                                                                <Badge className="px-2 py-1 rounded-full text-xs sm:text-sm font-medium">{item.status_label}</Badge>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="calendar">
                                <BookingCalendar />
                            </TabsContent>
                        </Tabs>
                        
                        <Dialog open={openBookingDialog} onOpenChange={setOpenBookingDialog}>
                            <DialogContent className="max-w-2xl sm:max-w-2xl p-0 ">
                                <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
                                    <DialogHeader className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="grow">
                                                <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl mt-2">
                                                    <Calendar className="h-5 w-5 text-primary" />
                                                    Bookings for {moment(`${openBooking?.booking_date}`, "YYYY-MM-DD").format("DD-MMM-YYYY")}
                                                </DialogTitle>
                                                <DialogDescription />
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        <div className="border rounded-lg bg-gray-50 shadow-sm p-4 md:p-6 space-y-4 transition-all">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <h4 className="font-semibold text-primary">
                                                        {openBooking?.booking_services?.map((bs: any) => bs.service?.service_item?.name?.trim())
                                                            .filter(Boolean)
                                                            .join(", ")
                                                        }
                                                    </h4>
                                                </div>
                                                <Badge>{openBooking?.status_label}</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-4 md:gap-y-2 text-sm text-gray-700">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center flex-wrap">
                                                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                                                        <span className="truncate">{openBooking?.branch?.name}</span>
                                                    </div>
                                                    <div className="flex items-center flex-wrap">
                                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                        <span className="truncate">{moment(`${openBooking?.booking_date} ${openBooking?.booking_time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center flex-wrap">
                                                        <User className="w-4 h-4 mr-2 text-primary" />
                                                        <span className="truncate">{openBooking?.stylist?.name}</span>
                                                    </div>
                                                    <div className="flex items-center flex-wrap">
                                                        <DollarSign className="w-4 h-4 mr-2 text-primary" />
                                                        <span>RM {openBooking?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
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
                                                                                {openBooking?.booking_services?.map((item: any, index: number) => (
                                                                                    <div className="flex justify-between text-xs" key={index}>
                                                                                        <span className="text-gray-600">{ item.service.service_item.name }</span>
                                                                                        <span className="text-gray-900 font-medium">RM { item.service.service_item.price }</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="border-t pt-2 mt-2">
                                                                                <div className="flex justify-between text-sm font-semibold">
                                                                                    <span className="text-gray-900">Total</span>
                                                                                    <span className="text-gray-900"> RM {openBooking?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                    {openBooking?.special_notes && (
                                                        <span className="flex items-center min-w-0 text-gray-700">
                                                            <MessageCircle className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                                            <span className="wrap-break-words whitespace-pre-line max-w-[180px] sm:max-w-full truncate">{openBooking?.special_notes}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4 gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="h-10 px-4 py-2"
                                                onClick={() => {
                                                    setOpenBookingDialog(false);
                                                    setOpenBooking(null);
                                                }}
                                            >
                                                Close
                                            </Button>
                                            <Button 
                                                className="transition-all duration-200 h-10 px-4 py-2 bg-primary text-white hover:bg-primary/90"
                                                onClick={() => {
                                                    setOpenEditBookingDialog(true);
                                                    setOpenBookingDialog(false);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
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

                                    <UserBooking booking={openBooking} type="edit" onClose={() => {setOpenBooking(null); setOpenEditBookingDialog(false); fetchData();}} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="rounded-lg text-card-foreground shadow-sm border-0 bg-white p-1">
                        <div className="flex flex-col space-y-1.5 p-6 pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500 p-2 rounded-lg">
                                        <Package className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="font-semibold tracking-tight text-lg text-gray-900">Active Packages</h3>
                                </div>
                                <Link href="/packages">
                                    <Button variant={"outline"} className="h-9 rounded-md px-3 text-xs">View All</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="p-6 pt-2 pb-6">
                            <ScrollArea className="h-72 w-full mt-6">
                                <div className="space-y-3">
                                    {packageList && (
                                        packageList.map((item, index) => (
                                            <div 
                                                className="p-3 bg-gray-50 rounded-lg border border-gray-50 hover:border-gray-200 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setOpenPackageDialog(true);
                                                    fetchPackageDetails(item.id);
                                                }}
                                                key={index}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <Package className="h-4 w-4 text-emerald-600 shrink-0" />
                                                        <h4 className="font-semibold text-gray-900 truncate">{item.package?.package_item?.name}</h4>
                                                    </div>
                                                </div>
                                                {/* <div className="space-y-2">
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <Clock className="h-3 w-3" />
                                                            Expires {moment(`${item.expiry_date}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}
                                                        </span>
                                                        {(item.service[0].total_sessions && item.service[0].total_sessions) && (
                                                            <span className="flex items-center gap-1">
                                                                {Math.round((item.service[0].remaining_sessions / item.service[0].total_sessions) * 100)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(item.service[0].total_sessions && item.service[0].total_sessions) && (
                                                        <Progress value={Math.round((item.service[0].remaining_sessions / item.service[0].total_sessions) * 100)} className="bg-gray-200 [&>div]:bg-linear-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600" />
                                                    )}
                                                </div> */}
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span>Sessions Used</span>
                                                            <span className="font-semibold">{item.service[0].total_sessions - item.service[0].remaining_sessions} / {item.service[0].total_sessions}</span>
                                                        </div>
                                                        <Progress value={Math.round(((item.service[0].total_sessions - item.service[0].remaining_sessions) / item.service[0].total_sessions) * 100)} className="bg-gray-200 [&>div]:bg-linear-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600" />
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <p>Expires:  {moment(`${item.expiry_date}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <Dialog open={openPackageDialog} onOpenChange={setOpenPackageDialog}>
                            <DialogContent className="max-w-2xl sm:max-w-2xl p-0 ">
                                <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
                                    <DialogHeader className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="grow">
                                                <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl mt-2">
                                                    <Package className="h-5 w-5 text-primary" />
                                                    {packageDetails?.package?.package_item?.name}
                                                    <Badge>Active</Badge>
                                                </DialogTitle>
                                                <DialogDescription />
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="flex-1 min-h-0 space-y-6 overflow-y-auto">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-3">Package Summary</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-1">
                                                    <span className="text-gray-600">Purchase Date:</span>
                                                    <p className="font-semibold text-gray-900">{moment(`${packageDetails?.booking_date}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-gray-600">Expiry Date:</span>
                                                    <p className="font-semibold text-gray-900">{moment(`${packageDetails?.expiry_date}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-gray-600">Total Sessions:</span>
                                                    <p className="font-semibold text-gray-900">{packageDetails?.total_sessions}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-gray-600">Used Sessions:</span>
                                                    <p className="font-semibold text-gray-900">{packageDetails?.packages_used?.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-3">Services Included</h4>
                                            <ul className="space-y-1">
                                                <li className="flex items-center text-sm gap-2">
                                                    <div className="flex-1 justify-between">
                                                        <div className="flex items-center">
                                                            <Star className="text-yellow-500 shrink-0 mr-2" />
                                                            <span>{packageDetails?.service[0]?.service?.service_item?.name}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        {packageDetails?.packages_used?.length > 0 && (
                                            <div>
                                                <div className="inline-flex px-3 py-1 rounded font-semibold text-sm mb-3">Usage History</div>
                                                <ScrollArea className="max-h-96 w-full">
                                                    <div className="space-y-3">
                                                        {packageDetails?.packages_used.map((item: any, index: number) => (
                                                            <Card key={index} className="p-0">
                                                                <div className="p-3">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="text-sm font-medium truncate">{packageDetails?.service[0]?.service?.service_item?.name}</div>
                                                                            </div>
                                                                            <Button 
                                                                                variant={"outline"} 
                                                                                className="h-9 px-3 rounded-md"
                                                                                onClick={() => {
                                                                                    getTransaction(item?.transactions?.id);
                                                                                    setOpenReceiptDialog(true);
                                                                                }}
                                                                            >
                                                                                <Eye className="mr-1" />
                                                                                Receipt
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <div className="flex flex-col text-xs text-gray-500">{moment(`${item?.transactions?.created_at}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm a")}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <Button 
                                            variant="outline" 
                                            className="h-10 px-4 py-2"
                                            onClick={() => {
                                                setOpenPackageDialog(false);
                                                setPackageDetails(null);
                                            }}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="hidden md:block md:col-span-2">
                    <div className="rounded-lg text-card-foreground shadow-sm border-0 bg-white">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary p-2 rounded-lg">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold tracking-tight text-lg text-gray-900">Quick Actions</h3>
                            </div>
                        </div>
                        <div className="p-6 px-6 space-y-6 pt-3">
                            <Link className="block" href="/book-appointment">
                                <Button className="text-white duration-200 px-4 py-2 w-full bg-primary hover:bg-gray-600 h-12 transition-colors">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book New Appointment
                                </Button>
                            </Link>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/booking">
                                    <Button variant="outline" className="h-10 text-sm w-full">
                                        <History className="h-4 w-4 mr-1" />
                                        Appointments
                                    </Button>
                                </Link>
                                <Link href="/packages">
                                    <Button variant="outline" className="h-10 text-sm w-full">
                                        <Package className="h-4 w-4 mr-1" />
                                        Packages
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Overview
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg text-card-foreground shadow-sm border-0 bg-gray-50 hover:shadow-sm transition-all duration-200">
                                        <div className="p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">{bookingList.length}</div>
                                            <div className="text-sm text-gray-500 font-medium">Upcoming Appointments</div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg text-card-foreground shadow-sm border-0 bg-gray-50 hover:shadow-sm transition-all duration-200">
                                        <div className="p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">{packageList.length}</div>
                                            <div className="text-sm text-gray-500 font-medium">Active Packages</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={openReceiptDialog} onOpenChange={setOpenReceiptDialog}>
                <DialogContent className="max-w-2xl sm:max-w-2xl p-0 ">
                    <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
                        <DialogHeader className="mb-4">
                            <div className="flex justify-center mb-3 mt-4">
                                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl">Receipt</DialogTitle>
                            <DialogDescription />
                        </DialogHeader>

                        <UserReceipt openReceipt={openReceipt} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
