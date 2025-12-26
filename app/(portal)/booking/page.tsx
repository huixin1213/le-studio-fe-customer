"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApiStore } from "@/stores/useApi";
import { Filter, Plus, SquarePen, Trash, MapPin, User, Calendar, DollarSign, Info, MessageCircle, Receipt, Download } from 'lucide-react';
import { toast } from "sonner";
import PageTitle from "@/components/custom/PageTitle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import moment from "moment-timezone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/custom/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserBooking from "@/components/custom/UserBooking";
import UserReceipt from "@/components/custom/UserReceipt";

export default function AppointmentsPage() {
    const apiStore = useApiStore();
    const [selectedTab, setSelectedTab] = useState("upcoming");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("all");
    const [branchId, setBranchId] = useState("all");
    const [branchList, setBranchList] = useState<any[]>([]);
    const [upcomingAppointmentList, setUpcomingAppointmentList] = useState<{
        current_page: number;
        last_page: number;
        total: number;
        data: any;
    }>({
        current_page: 0,
        last_page: 0,
        total: 0,
        data: [],
    });
    const [historyAppointmentList, setHistoryAppointmentList] = useState<{
        current_page: number;
        last_page: number;
        total: number;
        data: any;
    }>({
        current_page: 0,
        last_page: 0,
        total: 0,
        data: [],
    });
    const [openEditBookingDialog, setOpenEditBookingDialog] = useState(false);
    const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
    const [openBooking, setOpenBooking] = useState<any>(null);
    const [openReceipt, setOpenReceipt] = useState<any>(null);

    const handleTabChange = (value: string) => {
        setStartDate("");
        setEndDate("");
        setStatus("all");
        setSelectedTab(value);
    };

    async function fetchBranches() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/appointment/branch`,
                method: "GET",
            });

            setBranchList(data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchUpcomingAppoinments(page: number = 1) {
        const params = [];

        params.push("page=" + page);

        if ( startDate != "" ) {
            params.push("booking_date_from=" + startDate);
        }

        if ( endDate != "" ) {
            params.push("booking_date_to=" + endDate);
        }

        if ( status != "all" ) {
            params.push("status=" + status);
        }

        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/appointment/upcoming${params.length > 0 ? '?' + params.join('&') : ''}`,
                method: "GET",
            });

            if (data.data) {
                setUpcomingAppointmentList(prev => ({
                    ...prev,
                    current_page: data.current_page,
                    last_page: data.last_page,
                    data: data.data,
                    total: data.total
                }));
            }
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchHistoryAppoinments(page: number = 1) {
        const params = [];

        params.push("page=" + page);

        if ( startDate != "" ) {
            params.push("booking_date_from=" + startDate);
        }

        if ( endDate != "" ) {
            params.push("booking_date_to=" + endDate);
        }

        if ( status != "all" ) {
            params.push("status=" + status);
        }

        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/appointment/history${params.length > 0 ? '?' + params.join('&') : ''}`,
                method: "GET",
            });

            if (data.data) {
                setHistoryAppointmentList(prev => ({
                    ...prev,
                    current_page: data.current_page,
                    last_page: data.last_page,
                    data: data.data,
                    total: data.total
                }));
            }
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

    async function cancelAppointment(id: any) {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/appointment/${id}`,
                method: "DELETE",
            });

            toast(data.message);
            fetchUpcomingAppoinments();
        } catch (err: any) {
            // console.log(err)
        }
    }

    useEffect(() => {
        fetchBranches();
        fetchUpcomingAppoinments();
        fetchHistoryAppoinments();
    }, []);

    useEffect(() => {
        if ( selectedTab === "upcoming" ) {
            fetchUpcomingAppoinments();
        } else if ( selectedTab === "history" ) {
            fetchHistoryAppoinments();
        }
    }, [startDate, endDate, status]);

    return (
        <>
            <PageTitle title="My Appointments" />

            <div className="flex flex-row justify-between items-center gap-3 mb-6 animate-fade-in">
                <div className="shrink-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="h-10 px-4 py-2 relative bg-white border-gray-300 text-gray-700 hover:bg-gray-50" variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="p-1">
                            <div className="px-2 py-1.5 text-sm text-gray-900 font-semibold">Filter Appointments</div>

                            <div className="-mx-1 my-1 h-px bg-muted"></div>

                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Date Range</Label>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input type="date" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input type="date" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Status</Label>

                                    <Select 
                                        value={status}
                                        onValueChange={(value) =>
                                            setStatus(value)
                                        }
                                    >
                                        <SelectTrigger className="w-full bg-white cursor-pointer">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <Link className="flex-1 sm:flex-none" href="/book-appointment">
                    <Button className="h-10 bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto px-6 py-2.5 transition-all duration-200 hover:scale-105">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="upcoming" className="w-full space-y-1.5" onValueChange={handleTabChange}>
                <TabsList className="w-full">
                    <TabsTrigger value="upcoming">
                        <span>Upcoming ({upcomingAppointmentList.total})</span>
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <span>History ({historyAppointmentList.total})</span>
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                    <div className="space-y-3 sm:space-y-4 mb-4">
                        {upcomingAppointmentList.data.map((item: any, index: number) => (
                            <Card key={index} className="p-0 hover:shadow-md transition-all duration-300 border-gray-200 animate-fade-in hover:scale-101">
                                <div className="flex flex-col space-y-1.5 p-6 pb-2 sm:pb-3">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold tracking-tight text-base sm:text-lg truncate text-gray-900">
                                                {item.booking_services
                                                    .map((bs: any) => bs.service?.service_item?.name?.trim())
                                                    .filter(Boolean)
                                                    .join(", ")
                                                }
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge>{item.status_label}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-0 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span className="truncate">{item.branch?.name}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <User className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span className="truncate">{item.stylist?.name}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span className="truncate">
                                                {moment(`${item.booking_date} ${item.booking_time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span>RM {item?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
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
                                                                    {item?.booking_services?.map((item: any, index: number) => (
                                                                        <div className="flex justify-between text-xs" key={index}>
                                                                            <span className="text-gray-600">{ item.service.service_item.name }</span>
                                                                            <span className="text-gray-900 font-medium">RM { item.service.service_item.price }</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="border-t pt-2 mt-2">
                                                                    <div className="flex justify-between text-sm font-semibold">
                                                                        <span className="text-gray-900">Total</span>
                                                                        <span className="text-gray-900"> RM {item?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        {item?.special_notes && (
                                            <span className="flex items-center min-w-0 text-gray-700">
                                                <MessageCircle className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                                <span className="wrap-break-words whitespace-pre-line max-w-[180px] sm:max-w-full truncate">{item?.special_notes}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                                        <Button 
                                            className="border-gray-900 hover:bg-gray-900 hover:text-white h-8 px-3" 
                                            variant="outline"
                                            onClick={() => {
                                                setOpenEditBookingDialog(true);
                                                setOpenBooking(item);
                                            }}
                                        >
                                            <SquarePen className="w-3 h-3 mr-1" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="border bg-background hover:text-accent-foreground rounded-md text-red-600 border-red-300 hover:bg-red-50 text-xs h-8 px-3">
                                                    <Trash className="w-3 h-3 mr-1" />
                                                    <span className="hidden sm:inline">Cancel</span>
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-md max-w-md p-0 text-left">
                                                <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
                                                    <DialogHeader>
                                                        <DialogTitle />
                                                        <DialogDescription />
                                                    </DialogHeader>

                                                    <div className="mb-4">
                                                        <h2 className="font-bold text-lg mb-2">Cancel Appointment</h2>
                                                        <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                                                    </div>

                                                    <div className="flex justify-end gap-3 py-2">
                                                        <DialogClose asChild>
                                                            <Button variant="outline" type="button" className="hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Keep Appointment</Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button variant="destructive" type="button" className=" h-10 px-4 py-2" onClick={() => cancelAppointment(item?.id)}>Cancel Appointment</Button>
                                                        </DialogClose>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Pagination
                        totalPages={upcomingAppointmentList.last_page}
                        currentPage={upcomingAppointmentList.current_page}
                        onPageChange={fetchUpcomingAppoinments}
                    />

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

                                <UserBooking booking={openBooking} type="edit" onClose={() => {setOpenBooking(null); setOpenEditBookingDialog(false); fetchUpcomingAppoinments();}} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="history">
                    <div className="space-y-3 sm:space-y-4 mb-4">
                        {historyAppointmentList.data.map((item: any, index: number) => (
                            <Card key={index} className="p-0 hover:shadow-md transition-all duration-300 border-gray-200 animate-fade-in hover:scale-101">
                                <div className="flex flex-col space-y-1.5 p-6 pb-2 sm:pb-3">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold tracking-tight text-base sm:text-lg truncate text-gray-900">
                                                {item.booking_services
                                                    .map((bs: any) => bs.service?.service_item?.name?.trim())
                                                    .filter(Boolean)
                                                    .join(", ")
                                                }
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge className={`${item.status === 3 && 'bg-yellow-500 text-white'} ${item.status === 2 && 'bg-green-500 text-white'}`}>{item.status_label}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-0 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span className="truncate">{item.branch?.name}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <User className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span className="truncate">{item.stylist?.name}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span className="truncate">
                                                {moment(`${item.booking_date} ${item.booking_time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                            <span>RM {item?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
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
                                                                    {item?.booking_services?.map((item: any, index: number) => (
                                                                        <div className="flex justify-between text-xs" key={index}>
                                                                            <span className="text-gray-600">{ item.service.service_item.name }</span>
                                                                            <span className="text-gray-900 font-medium">RM { item.service.service_item.price }</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="border-t pt-2 mt-2">
                                                                    <div className="flex justify-between text-sm font-semibold">
                                                                        <span className="text-gray-900">Total</span>
                                                                        <span className="text-gray-900"> RM {item?.booking_services?.reduce((sum: any, s: any) => sum + parseFloat(String(s.service.service_item.price || "0")), 0).toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        {item?.special_notes && (
                                            <span className="flex items-center min-w-0 text-gray-700">
                                                <MessageCircle className="w-3 h-3 mr-2 shrink-0 text-gray-900" />
                                                <span className="wrap-break-words whitespace-pre-line max-w-[180px] sm:max-w-full truncate">{item?.special_notes}</span>
                                            </span>
                                        )}
                                    </div>
                                    {item.status !== 3 && (
                                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                                            <Button 
                                                className="hover:bg-gray-900 hover:text-white h-8 px-3" 
                                                variant="outline"
                                                onClick={() => {
                                                    getTransaction(item?.transaction?.id);
                                                }}
                                            >
                                                <Receipt className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Receipt</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Pagination
                        totalPages={historyAppointmentList.last_page}
                        currentPage={historyAppointmentList.current_page}
                        onPageChange={fetchHistoryAppoinments}
                    />

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
                </TabsContent>
            </Tabs>
        </>
    );
}