"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { Filter, Plus, SquarePen, Eye, Calendar } from 'lucide-react';
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
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PackagesPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const apiStore = useApiStore();
    const [activePackageList, setActivePackageList] = useState<any[]>([]);
    const [historyPackageList, setHistoryPackageList] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("all");

    async function fetchActivePackages() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/package/active`,
                method: "GET",
            });

            console.log(data);

            setActivePackageList(data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchHistoryPackages() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/package/history`,
                method: "GET",
            });

            setHistoryPackageList(data.data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    useEffect(() => {
        fetchActivePackages();
        fetchHistoryPackages();
    }, []);

    if (!mounted) return null;

    return (
        <>
            <PageTitle title="My Packages" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-salon-primary animate-fade-in mb-4">Active Packages ({activePackageList && activePackageList.length})</h3>

                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {activePackageList && activePackageList.map((item, index) => (
                                <CarouselItem key={index} className="lg:basis-1/2">
                                    <Card className="p-0">
                                        <div className="flex flex-col space-y-1.5 p-6">
                                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex justify-between items-start gap-2 flex-wrap">
                                                <span className="wrap-break-word">{item.package.package_item.name}</span>
                                                <Badge>{item.status_label}</Badge>
                                            </h3>
                                            <p className="text-sm text-muted-foreground">Purchased on {moment(`${item.purchased_at}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}</p>
                                        </div>
                                        <div className="p-6 pt-0 space-y-4">
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
                                            <div className="flex justify-end">
                                                <Button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" variant="outline">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="z-10 hidden md:flex translate-x-5" />
                        <CarouselNext className="z-10 hidden md:flex -translate-x-5" />
                    </Carousel>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-salon-primary mb-4 animate-fade-in">Package History</h3>

                    <Card className="p-0 gap-0">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-salon-primary">
                                <Calendar className="w-5 h-5" />
                                Package History
                            </h3>
                        </div>

                        <div className="p-6 pt-0">
                            <div className="mb-6">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="h-10 px-4 py-2 relative bg-white border-gray-300 text-gray-700 hover:bg-gray-50" variant="outline">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="p-1">
                                        <div className="px-2 py-1.5 text-sm text-gray-900 font-semibold">Filter Packages</div>

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
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="expired">Expired</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}