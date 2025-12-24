"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { Filter, Plus, SquarePen, Wallet, Calendar } from 'lucide-react';
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

export default function DashboardPage() {
    const apiStore = useApiStore();
    const [topupList, setTopupList] = useState<{
        current_balance: string;
        latest_update: string;
        current_page: number;
        last_page: number;
        total: number;
        data: any;
    }>({
        current_balance: "0",
        latest_update: "",
        current_page: 0,
        last_page: 0,
        total: 0,
        data: [],
    });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [type, setType] = useState("all");

    async function fetchTopupList() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/topup`,
                method: "GET",
            });

            console.log(data);

            setTopupList(prev => ({
                ...prev,
                current_balance: data.current_balance,
                latest_update: data.latest_update,
                current_page: data.current_page,
                last_page: data.last_page,
                data: data.data,
                total: data.total
            }));
        } catch (err: any) {
            // console.log(err)
        }
    }
    
    useEffect(() => {
        fetchTopupList();
    }, []);

    return (
        <>
            <PageTitle title="Top Up" />
            
            <div className="space-y-8">
                <Card className="p-0 gap-0">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-salon-primary">
                            <Wallet className="w-6 h-6" />
                            Current Balance
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-baseline gap-2"><span className="text-4xl font-bold text-salon-primary">RM {topupList.current_balance}</span><span className="text-lg text-gray-600">Available</span></div>
                                <p className="text-sm text-gray-500 mt-1">Last updated: {moment(`${topupList.latest_update}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 gap-0">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-salon-primary">
                            <Calendar className="w-5 h-5" />
                            Top Up History
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
                                    <div className="px-2 py-1.5 text-sm text-gray-900 font-semibold">Filter Top Up</div>

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
                                            <Label className="text-sm font-medium text-gray-700">Type</Label>

                                            <Select 
                                                value={type}
                                                onValueChange={(value) =>
                                                    setType(value)
                                                }
                                            >
                                                <SelectTrigger className="w-full bg-white cursor-pointer">
                                                    <SelectValue placeholder="Select your gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="topup">Top Up</SelectItem>
                                                    <SelectItem value="redeemed">Redeemed</SelectItem>
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
        </>
    );
}