"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiStore } from "@/stores/useApi";
import PageTitle from "@/components/custom/PageTitle";
import { CircleAlert, CircleCheckBig, MapPin, ChevronDown, User, Scissors, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhoneInput } from '@/components/custom/PhoneInput';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment-timezone";
import { toast } from "sonner";
import { DialogClose } from "@/components/ui/dialog";

type FormData = {
    booking_date: string | null;
    booking_time: string | null;
    branches_id: string | null;
    services: string[];
    special_notes: string | null;
    stylist_id: string | null;
};

interface UserBookingProps {
    type: string;
    booking?: any;
    onClose?: () => void;
}

export default function UserBooking({
    type,
    booking,
    onClose
}: UserBookingProps) {
    const router = useRouter();
    const apiStore = useApiStore();
    const [formData, setFormData] = useState<FormData>({
        booking_date: null,
        booking_time: null,
        branches_id: null,
        services: [],
        special_notes: null,
        stylist_id: null,
    });
    const [openLocation, setOpenLocation] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);
    const [selectedStylist, setSelectedStylist] = useState<any>(null);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [stylistList, setStylistList] = useState<{ id: string; name: string }[]>([]);
    const [searchServices, setSearchServices] = useState("");
    const [servicesSubCatList, setServicesSubCatList] = useState<{ id: string; name: string }[]>([]);
    const [selectedServicesSubCat, setSelectedServicesSubCat] = useState("");
    const [servicesList, setServicesList] = useState<{ id: string; service_item: {name: string; duration: string; price: string; id: string; items_id: string;} }[]>([]);
    const [selectedServices, setSelectedServices] = useState<{ id?: string; service_item: { id?: string; items_id: string; name: string; duration?: string; price?: string } }[]>([]);
    const [availableTimeList, setAvailableTimeList] = useState<{ time: string; is_occupied: boolean }[]>([]);

    async function fetchBranches() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/appointment/branch`,
                method: "GET",
            });

            if ( data.length ) {
                setSelectedBranch(data[0]);
                setStylistList(data[0].stylist);
                setFormData(prev => ({ ...prev, branches_id: data[0].id }));
            }

            setBranchList(data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchServicesSubCat() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/subcategory`,
                method: "GET",
            });

            if ( data.services ) {
                setServicesSubCatList(data.services);
            }
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchServicesList() {
        const params = [];

        if ( searchServices != "" ) {
            params.push("search=" + searchServices);
        }

        if ( selectedServicesSubCat != "" ) {
            params.push("subcategories_id=" + selectedServicesSubCat);
        }

        if ( formData.stylist_id != "" && formData.stylist_id != null ) {
            params.push("stylist_id=" + formData.stylist_id);
        }

        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/items/services${params.length > 0 ? '?' + params.join('&') : ''}`,
                method: "GET",
            });

            setServicesList(data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchAvailableTime() {
        if ( formData.branches_id == null || formData.booking_date == null || formData.stylist_id == null ) {
            return null;
        }

        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/appointment/available-time?branches_id=${formData.branches_id}&booking_date=${formData.booking_date}${formData.stylist_id != "" && formData.stylist_id != null ? "&stylist_id=" + formData.stylist_id : ""}`,
                method: "GET",
            });

            if ( data.timeslots ) {
                setAvailableTimeList(data.timeslots);
            } else {
                setAvailableTimeList([]);
            }
        } catch (err: any) {
            setAvailableTimeList([]);
            // console.log(err)
        }
    }

    async function submitForm() {
        try {
            if ( !formData.booking_time ) {
                toast("Please select booking time.");
                return;
            }

            if ( formData.services.length <= 0 ) {
                toast("Please select service.");
                return;
            }

            const data = await apiStore.crudRequest({
                endpoint: type === "edit" ? `customer/appointment/${booking.id}` : `customer/appointment`,
                method: "POST",
                body: formData
            });

            if ( data.errors ) {
                toast(data.message);
            } else {
                toast(data.message);

                if ( type === "edit" ) {
                    onClose?.();
                } else {
                    router.push("/booking");
                }
            }
        } catch (err: any) {
            // console.log(err)
        }
    }

    useEffect(() => {
        fetchBranches();
        fetchServicesSubCat();
        fetchServicesList();
        fetchAvailableTime();
    }, []);

    useEffect(() => {
        if ( formData.branches_id != null && formData.booking_date != null && formData.stylist_id != null ) {
            fetchAvailableTime();
        }
    }, [formData.branches_id, formData.booking_date, formData.stylist_id]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            booking_time: null
        }));
    }, [formData.booking_date]);

    useEffect(() => {
        fetchServicesList();
        setSelectedServices([]);
    }, [searchServices, selectedServicesSubCat, formData.stylist_id]);

    useEffect(() => {
        if (type === "edit" && booking) {
            setFormData((prev) => ({
                ...prev,
                branches_id: booking.branches_id,
                stylist_id: booking.stylist_id,
                special_notes: booking.special_notes,
                booking_date: booking.booking_date,
                booking_time: booking.booking_time,
                services: booking.booking_services.map((item: any) => item.items_id),
            }));

            const services = booking.booking_services.map((item: any) => item.service);

            setTimeout(() => {
                setSelectedServices(services);
            }, 1000);

            if (branchList && branchList.length > 0) {
                const selectedBranchObj = branchList.find(b => b.id === booking.branches_id);
                if (selectedBranchObj) {
                    setSelectedBranch(selectedBranchObj);
                    setStylistList(selectedBranchObj.stylist);

                    const selectedStylist = selectedBranchObj.stylist.find((s: any) => s.id === booking.stylist_id);
                    if (selectedStylist) {
                        // stylist found → set it
                        setFormData(prev => ({ ...prev, stylist_id: selectedStylist.id }));
                    } else {
                        // stylist not found or null → select random
                        setFormData(prev => ({ ...prev, stylist_id: '' }));
                    }
                }
            }
        }
    }, [type, booking]);

    return (
        <>
            {type === "new" && (
                <PageTitle title="Book Your Appointments" />
            )}

            <div className={`${type === 'new' ? 'grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8' : ''}`}>
                <div className={`${type === 'new' ? 'lg:col-span-8 space-y-4 sm:space-y-6' : 'space-y-4'}`}>
                    <Card className="p-0 rounded-lg gap-0">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                            <h3 className="font-semibold tracking-tight flex items-center gap-2 text-primary text-base sm:text-lg">
                                <MapPin className="h-4 w-4" />
                                {type === "new" ? ('Choose') : ('Edit')} Location
                            </h3>
                        </div>
                        <div className="p-6 pt-0 space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                            <div className="relative">
                                <div className="w-full p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[60px] sm:min-h-[70px] border-primary bg-white" onClick={() => setOpenLocation(prev => !prev)}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{selectedBranch && selectedBranch.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-600 mt-1 wrap-break-word leading-relaxed">{selectedBranch && selectedBranch.address} • {selectedBranch && selectedBranch.phone_number}</p>
                                            </div>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform mt-1 shrink-0" />
                                    </div>
                                </div>

                                {(openLocation && branchList) && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                        {branchList.map((item, index) => (
                                            item.status == 1 && (
                                                <div 
                                                    className="p-3 sm:p-4 cursor-pointer transition-colors hover:bg-gray-50 min-h-[60px] border-b border-gray-100" 
                                                    key={index} 
                                                    onClick={() => {
                                                        setOpenLocation(prev => !prev),
                                                        setSelectedBranch(item)
                                                        setStylistList(item.stylist);
                                                        setFormData(prev => ({ ...prev, stylist_id: null }));
                                                        setFormData(prev => ({ ...prev, branches_id: item.id }));
                                                    }}
                                                >
                                                    <p className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{item.name}</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 wrap-break-word leading-relaxed">{item.address}</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 wrap-break-word leading-relaxed">{item.phone_number}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                    <Card className="p-0 rounded-lg gap-0">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                            <h3 className="font-semibold tracking-tight flex items-center gap-2 text-primary text-base sm:text-lg">
                                <User className="h-4 w-4" />
                                <span>{type === "new" ? ('Choose') : ('Edit')} Stylist</span>
                            </h3>
                        </div>

                        <div className="p-6 pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600 mb-3">Choose your preferred stylist ({stylistList.length + 1} available)</div>

                                <div 
                                    className={`p-4 border-2 rounded-lg transition-all ${formData.stylist_id == '' ? "border-primary" : "border-gray-200 hover:border-primary/50"}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, stylist_id: '' }));
                                        setSelectedStylist(null);
                                    }}
                                >
                                    <div className="flex gap-3 w-full items-center">
                                        <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${formData.stylist_id == '' ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
                                            >
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 wrap-break-word">Random Selection</h4>
                                                <p className="text-sm text-gray-500">Let us choose the best stylist for you</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {stylistList.map((item, index) => (
                                    <div 
                                        className={`p-4 border-2 rounded-lg transition-all ${formData.stylist_id == item.id ? "border-primary" : "border-gray-200 hover:border-primary/50"}`}
                                        key={index}
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, stylist_id: item.id }));
                                            setSelectedStylist(item);
                                        }}
                                    >
                                        <div className="flex gap-3 w-full items-center">
                                            <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${formData.stylist_id == item.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
                                                >
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 wrap-break-word">{item.name}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                    <Card className="p-0 rounded-lg gap-0">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                            <h3 className="font-semibold tracking-tight flex items-center gap-2 text-primary text-base sm:text-lg">
                                <Scissors className="h-4 w-4" />
                                <span>{type === "new" ? ('Select') : ('Edit')} Services</span>
                            </h3>
                        </div>

                        <div className="p-6 pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Input className="bg-white" type="text" placeholder="Search services" value={searchServices} onChange={(e) => setSearchServices(e.target.value)} />
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant={selectedServicesSubCat == "" ? "default" : "outline"} onClick={() => setSelectedServicesSubCat("")}>All</Button>
                                        {servicesSubCatList.map((item, index) => (
                                            <Button type="button" key={index} variant={selectedServicesSubCat == item.id ? "default" : "outline"} onClick={() => setSelectedServicesSubCat(item.id)}>{item.name}</Button>
                                        ))}
                                    </div>
                                </div>
                                {selectedServices.length > 0 && (
                                    <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-primary">Selected Services ({selectedServices.length})</span>
                                            <Button 
                                                type="button"  
                                                className="bg-transparent h-6 w-6 text-primary-20 rounded-md p-1 hover:bg-accent" 
                                                onClick={() => {
                                                    setSelectedServices([]);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        services: [],
                                                    }));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedServices.map((item, index) => (
                                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 text-xs bg-primary/20 text-primary border-primary/30 wrap-break-word" key={index}>{item.service_item.name}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="max-h-80 overflow-y-auto space-y-2">
                                    {servicesList.map((item) => {
                                        // const isChecked = selectedServices.includes(item);
                                        const isChecked = selectedServices.some((s) => s.service_item.items_id === item.service_item.items_id);

                                        return (
                                            <Label
                                                key={item.id}
                                                className={`flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[60px] ${
                                                isChecked ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                                                }`}
                                            >
                                                <Checkbox
                                                    id={item.service_item.items_id}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked: any) => {
                                                        if (checked) {
                                                            setSelectedServices((prev) => [...prev, item]);
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                // services: [...prev.services, item.service_item.items_id],
                                                                services: Array.from(
                                                                    new Set([...prev.services, item.service_item.items_id])
                                                                ),
                                                            }));
                                                        } else {
                                                            setSelectedServices((prev) =>
                                                                prev.filter((s) => s.service_item.items_id !== item.service_item.items_id)
                                                            );
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                services: prev.services.filter((id) => id !== item.service_item.items_id),
                                                            }));
                                                        }
                                                    }}
                                                />

                                                <div className="flex flex-col w-full min-w-0">
                                                    <div className="flex items-start gap-2 flex-wrap">
                                                        <span className="font-medium text-sm sm:text-base wrap-break-word leading-tight text-gray-900">
                                                            {item.service_item.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        <span className="font-medium text-primary">
                                                            RM {item.service_item.price} •{" "}
                                                        </span>
                                                        {item.service_item.duration} min
                                                    </div>
                                                </div>
                                            </Label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-0 rounded-lg gap-0">
                        <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                            <h3 className="font-semibold tracking-tight flex items-center gap-2 text-primary text-base sm:text-lg">
                                <Calendar className="h-4 w-4" />
                                <span>{type === "new" ? ('Select') : ('Edit')} Date & Time</span>
                            </h3>
                        </div>

                        <div className="p-6 pt-0 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                            {formData.stylist_id !== null ? (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2 ">
                                        <Label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary font-medium flex items-center gap-2" htmlFor="appointmentDate">
                                            <Calendar className="h-4 w-4" />
                                            <span>Appointment Date</span>
                                        </Label>

                                        <div className="relative">
                                            <input type="date" className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white" id="appointmentDate" value={formData.booking_date ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))} />
                                        </div>
                                    </div>

                                    {/* <p className="text-sm text-gray-600 -mt-2">Tuesday, October 14, 2025</p> */}

                                    <div>
                                        <Label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 mb-3 text-primary font-medium">
                                            <Clock className="h-4 w-4" />
                                            <span>Available Times</span>
                                        </Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                            {availableTimeList && availableTimeList.map((item, index) => (
                                                <Button key={index} type="button" variant={ formData.booking_time == item.time ? "default" : "outline" } onClick={() => setFormData(prev => ({ ...prev, booking_time: item.time }))} className={`${formData.booking_time == item.time ? "hover:bg-primary/90 " : "hover:bg-primary/10 hover:border-primary"}`} disabled={item.is_occupied}>
                                                    {moment(item.time, "HH:mm:ss").format("hh:mm A")}
                                                </Button>
                                            ))}
                                        </div>
                                        {(availableTimeList.length <= 0) && (
                                            <p className="text-sm text-gray-600 mb-3">No available times. Please choose another stylist or date.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 mt-4 p-4 bg-gray-50 rounded-lg">
                                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">Please select a stylist to view available dates and times.</p>
                                </div>
                            )}
                            
                            <div className="mt-4 sm:mt-6">
                                <Label htmlFor="notes" >Special Notes (Optional)</Label>
                                <Textarea placeholder="Any special requests or requirements..." id="notes" className="mt-2 bg-white min-h-20" value={formData.special_notes ?? ""} onChange={(e: any) => setFormData(prev => ({ ...prev, special_notes: e.target.value }))} />
                            </div>
                        </div>
                    </Card>

                    {type === "edit" && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CircleAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-red-800">Please select:</p>
                                    <p className="text-xs text-red-700 wrap-break-word">Date, Time</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {type === "edit" && (
                        <div className="flex gap-2 pt-4">
                            <DialogClose className="hover:bg-accent h-10 px-4 py-2 border rounded-md flex-1">Cancel</DialogClose>
                            <Button className="text-white transition-all duration-200 h-10 px-4 py-2 bg-primary hover:bg-primary/90 flex-1" onClick={() => submitForm()}>Reschedule</Button>
                        </div>
                    )}
                </div>
                {type === "new" && (
                    <div className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-28">
                            <div className="rounded-lg bg-card text-card-foreground border border-gray-200 shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6">
                                    <h3 className="font-semibold tracking-tight text-primary text-base sm:text-lg">Booking Summary</h3>
                                </div>
                                <div className="p-6 pt-0 space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                                    {formData.branches_id !== null && (
                                        <div className="pb-3 border-b border-gray-200">
                                            <p className="font-medium text-gray-900 text-sm mb-1">{selectedBranch.name}</p>
                                            <p className="text-xs text-gray-600 leading-relaxed wrap-break-word">{selectedBranch.address} • {selectedBranch.phone_number}</p>
                                        </div>
                                    )}
                                    {formData.stylist_id !== null && (
                                        <div className="pb-3 border-b border-gray-200">
                                            <p className="font-medium text-gray-900 text-sm mb-2">Stylist:</p>
                                            <p className="font-medium text-gray-900 text-sm">{selectedStylist ? selectedStylist.name : 'Random'}</p>
                                            {selectedStylist && (
                                                <p className="text-xs text-gray-600 leading-relaxed wrap-break-word">{selectedStylist.stylist_positions_id} • {selectedStylist.mobile_no}</p>
                                            )}
                                        </div>
                                    )}
                                    {selectedServices.length > 0 && (
                                        <div className="pb-3 border-b border-gray-200">
                                            <p className="font-medium text-gray-900 text-sm mb-2">Services:</p>
                                            {selectedServices.map((item, index) => (
                                                <div className="flex justify-between items-center gap-3" key={index}>
                                                    <div className="font-medium text-gray-900 text-xs leading-relaxed flex-1 min-w-0">
                                                        <span className="wrap-break-word">{item.service_item.name}</span>
                                                    </div>
                                                    <div className="text-primary font-semibold text-xs shrink-0">
                                                        <span className="whitespace-nowrap">RM {item.service_item.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {(formData.booking_date !== null && formData.booking_time !== null) && (
                                        <div className="pb-3 border-b border-gray-200">
                                            <p className="font-medium text-gray-900 text-sm mb-2">Appointment Date & Time::</p>
                                            <p className="text-xs text-gray-600 leading-relaxed wrap-break-word">{moment(`${formData.booking_date} ${formData.booking_time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}</p>
                                        </div>
                                    )}

                                    {(formData.branches_id === null || formData.stylist_id === null || selectedServices.length <= 0 || formData.booking_date === null || formData.booking_time === null) && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <CircleAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-medium text-red-800">Please select:</p>
                                                    <p className="text-xs text-red-700 wrap-wrap-break-word">{selectedServices.length <= 0 && "Service,"} {formData.branches_id === null && "Branch,"} {formData.stylist_id === null && "Stylist,"} {formData.booking_date === null && "Date,"} {formData.booking_time === null && "Time"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <Button 
                                        className="text-white hover:bg-primary/90 transition-all duration-200 h-11 rounded-md px-8 w-full text-sm sm:text-base min-h-11" 
                                        disabled={(formData.branches_id === null || formData.stylist_id === null || selectedServices.length <= 0 || formData.booking_date === null || formData.booking_time === null)}
                                        onClick={() => submitForm()}
                                    >
                                        <CircleCheckBig className="h-4 w-4 mr-2" />
                                        Confirm Booking
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
