"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { Filter, Receipt, ArrowUpDown, Wallet, Calendar, Download, MapPin, User, ArrowUp, ArrowDown } from 'lucide-react';
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
import Pagination from "@/components/custom/Pagination";
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
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import UserReceipt from "@/components/custom/UserReceipt";

type Topup = {
  type: string;
  amount: string;
  date: string;
  transaction_id: number;
};

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
    const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
    const [openReceipt, setOpenReceipt] = useState<any>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const SortableHeader = ({ column, title }: { column: any; title: string }) => {
        const isSorted = column.getIsSorted();

        return (
            <Button
                variant="ghost"
                className="h-8 px-0! flex items-center gap-1 text-muted-foreground!"
                onClick={() => column.toggleSorting(isSorted === "asc")}
            >
                {title}

                {isSorted === "asc" && <ArrowUp className="w-4 h-4 text-muted-foreground" />}
                {isSorted === "desc" && <ArrowDown className="w-4 h-4 text-muted-foreground" />}
                {!isSorted && <ArrowUpDown className="w-4 h-4 text-muted-foreground" />}
            </Button>
        );
    };
    const columns: ColumnDef<Topup>[] = [
        {
            accessorKey: "date",
            header: ({ column }) => (
                <SortableHeader column={column} title="Date & Time" />
            ),
            cell: ({ row }) =>
                moment(row.original.date).format("DD-MMM-YYYY, hh:mm A"),
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <SortableHeader column={column} title="Type" />
            ),
            cell: ({ row }) => (
                <Badge className={`${row.original.type === "topup" ? "bg-green-500" : "bg-red-500"} text-white capitalize`}>
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <SortableHeader column={column} title="Amount" />
            ),
            cell: ({ row }) => (
                row.original.type === "topup" ? (
                    <span className="text-green-600 font-medium">+ RM {row.original.amount}</span>
                ) : (
                    <span className="text-red-600 font-medium">- RM {row.original.amount}</span>
                )
            ),
        },
        {
            id: "actions",
            header: "Action",
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    className="hover:bg-gray-900 hover:text-white h-8 px-3"
                    variant="outline"
                    onClick={() => {
                        getTransaction(row.original.transaction_id);
                    }}
                >
                    <Receipt className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Receipt</span>
                </Button>
            ),
        },
    ];
    const table = useReactTable({
        data: topupList.data,
        columns,
        state: {
            sorting,
        },
        manualSorting: true,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
    });

    async function fetchTopupList(page: number = 1) {
        try {
            const sortField = sorting?.[0]?.id ?? "";
            const sortOrder = sorting?.[0]?.desc ? "desc" : "asc";

            const query = new URLSearchParams({
                transaction_date_from: startDate,
                transaction_date_to: endDate,
                type: type,
                sort: sortField,
                order: sortOrder,
                page: page.toString(),
            }).toString();

            const data = await apiStore.crudRequest({
                endpoint: `customer/topup?${query}`,
                method: "GET",
            });

            setTopupList({
                current_balance: data.current_balance,
                latest_update: data.latest_update,
                current_page: data.current_page,
                last_page: data.last_page,
                data: data.data,
                total: data.total,
            });
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
        fetchTopupList();
    }, []);

    useEffect(() => {
        fetchTopupList();
    }, [sorting, startDate, endDate, type]);

    return (
        <>
            <PageTitle title="Top Up" />
            
            <div className="space-y-8">
                <Card className="p-0 gap-0">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-primary">
                            <Wallet className="w-6 h-6" />
                            Current Balance
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-baseline gap-2"><span className="text-4xl font-bold text-primary">RM {topupList.current_balance}</span><span className="text-lg text-gray-600">Available</span></div>
                                <p className="text-sm text-gray-500 mt-1">Last updated: {moment(`${topupList.latest_update}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY, hh:mm A")}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 gap-0">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-primary">
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

                        <div>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>

                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center">
                                                No records found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                                                        
                            <div className="mt-4">
                                <Pagination
                                    totalPages={topupList.last_page}
                                    currentPage={topupList.current_page}
                                    onPageChange={fetchTopupList}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
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
                            <DialogTitle className="font-semibold tracking-tight flex items-center gap-2 text-xl justify-center">Receipt</DialogTitle>
                            <DialogDescription />
                        </DialogHeader>

                        <UserReceipt openReceipt={openReceipt} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}