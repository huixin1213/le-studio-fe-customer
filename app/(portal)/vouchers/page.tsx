"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { Filter, Receipt, ArrowUpDown, Wallet, Calendar, Download, MapPin, User, Eye, Package, Star, ArrowUp, ArrowDown, Ticket } from 'lucide-react';
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

type VoucherHistory = {
    type: string;
    voucher_name: string;
    amount: string;
    date: string;
    transaction_id?: number;
};

export default function VouchersPage() {
    const apiStore = useApiStore();
    const [activeVoucherList, setActiveVoucherList] = useState<any[]>([]);
    const [historyVoucherList, setHistoryVoucherList] = useState<{
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
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [type, setType] = useState("all");
    const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
    const [openReceipt, setOpenReceipt] = useState<any>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const SortableHeader = ({
        column,
        title,
    }: {
        column: any;
        title: string;
    }) => {
        const isSorted = column.getIsSorted();

        return (
            <Button
                variant="ghost"
                className="h-8 px-0! flex items-center gap-1 text-muted-foreground!"
                onClick={() => column.toggleSorting()}
            >
                {title}

                {isSorted === "asc" && <ArrowUp className="w-4 h-4 text-muted-foreground" />}
                {isSorted === "desc" && <ArrowDown className="w-4 h-4 text-muted-foreground" />}
                {!isSorted && <ArrowUpDown className="w-4 h-4 text-muted-foreground" />}
            </Button>
        );
    };
    const columns: ColumnDef<VoucherHistory>[] = [
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <SortableHeader column={column} title="Date & Time" />
            ),
            cell: ({ row }) =>
            moment(row.original.date).format(
                "DD MMM YYYY, hh:mm A"
            ),
        },
        {
            id: "voucher",
            accessorFn: row =>
            `RM${row.amount} Cash Voucher - ${row.voucher_name}`,
            header: ({ column }) => (
                <SortableHeader column={column} title="Voucher" />
            ),
            cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">
                    RM {row.original.amount} Cash Voucher
                </span>
                <span className="text-xs text-gray-500">
                    {row.original.voucher_name}
                </span>
            </div>
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <SortableHeader column={column} title="Type" />
            ),
            cell: ({ row }) => (
                <Badge className={`${row.original.type === "redeemed" ? "bg-red-500" : "bg-green-500"} text-white capitalize`}>
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
                <span className="font-medium">
                    RM {row.original.amount}
                </span>
            ),
        },
        {
            id: "actions",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0! text-muted-foreground"
                >
                    Action
                </Button>
            ),
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    className="h-8 px-3 hover:bg-gray-900 hover:text-white"
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
        data: historyVoucherList.data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableSortingRemoval: true,
    });


    async function fetchActiveVouchers() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/voucher/active`,
                method: "GET",
            });

            console.log(data);

            setActiveVoucherList(data);
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchHistoryVouchers() {
        try {
            const sortField = sorting?.[0]?.id ?? "";
            const sortOrder = sorting?.[0]?.desc ? "desc" : "asc";

            const query = new URLSearchParams({
                transaction_date_from: startDate,
                transaction_date_to: endDate,
                status: status,
                sort: sortField,
                order: sortOrder,
            }).toString();

            const data = await apiStore.crudRequest({
                endpoint: `customer/voucher/history?${query}`,
                method: "GET",
            });

            setHistoryVoucherList({
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
        fetchActiveVouchers();
        fetchHistoryVouchers();
    }, []);

    useEffect(() => {
        fetchHistoryVouchers();
    }, [sorting, startDate, endDate, status]);

    return (
        <>
            <PageTitle title="My Vouchers" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-salon-primary animate-fade-in mb-4">Available Vouchers ({activeVoucherList && activeVoucherList.length})</h3>

                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {activeVoucherList.map((item, index) => (
                                <CarouselItem key={index} className="lg:basis-1/3">
                                    <Card className="p-0 gap-0">
                                        <div className="flex flex-col space-y-1.5 p-6">
                                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex justify-between items-start gap-2 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <Ticket className="w-5 h-5 text-salon-primary" />
                                                    <h3 className="font-semibold tracking-tight text-lg">{item.name}</h3>
                                                </div>
                                                <Badge>Available</Badge>
                                            </h3>
                                        </div>
                                        <div className="p-6 pt-0 space-y-3">
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold text-salon-primary">RM {item.value}</p>
                                                <p className="text-sm text-muted-foreground">Exp: {moment(`${item.expiry_date}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}</p>
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
                    <h3 className="text-xl font-semibold text-salon-primary mb-4 animate-fade-in">Voucher History</h3>

                    <Card className="p-0 gap-0">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-salon-primary">
                                <Calendar className="w-5 h-5" />
                                Voucher History
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
                                        <div className="px-2 py-1.5 text-sm text-gray-900 font-semibold">Filter Vouchers</div>

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
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All</SelectItem>
                                                        <SelectItem value="reward">Reward</SelectItem>
                                                        <SelectItem value="redeemed">Redeemed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

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
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No voucher history found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            
                            <div className="mt-4">
                                <Pagination
                                    totalPages={historyVoucherList.last_page}
                                    currentPage={historyVoucherList.current_page}
                                    onPageChange={fetchHistoryVouchers}
                                />
                            </div>
                        </div>
                    </Card>
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

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-900" />
                                        <span>{openReceipt?.created_at ? moment(openReceipt?.created_at).format('dddd, MMMM D, YYYY, h:mm A') : "-"}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-900" />
                                        <span>{openReceipt?.branch.name}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <User className="w-4 h-4 mr-2 text-gray-900" />
                                        <span>{openReceipt?.stylist.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                                <div className="space-y-2">
                                    {openReceipt?.transaction_item?.map((transaction: any, index: number) => {
                                        switch (transaction.item_type) {
                                            case "products":
                                                return <div className="flex justify-between text-sm" key={index}><span className="text-gray-600">{transaction.item?.product_item?.name}</span><span className="text-gray-900 font-medium">RM {transaction.item?.product_item?.price}</span></div>
                                            case "packages":
                                                return <div className="flex justify-between text-sm" key={index}><span className="text-gray-600">{transaction.item?.package_item?.name}</span><span className="text-gray-900 font-medium">RM {transaction.item?.package_item?.price}</span></div>
                                            case "services":
                                                return <div className="flex justify-between text-sm" key={index}><span className="text-gray-600">{transaction.item?.service_item?.name}</span><span className="text-gray-900 font-medium">RM {transaction.item?.service_item?.price}</span></div>
                                            case "topup":
                                                return <div className="flex justify-between text-sm" key={index}><span className="text-gray-600">Topup</span><span className="text-gray-900">RM {transaction.item?.topup_item?.price}</span></div>
                                            case "vouchers":
                                                return <div className="flex justify-between text-sm" key={index}><span className="text-gray-600">{transaction.item?.voucher_item?.name}</span><span className="text-gray-900">RM {transaction.item?.voucher_item?.value}</span></div>
                                            default:
                                                return "-";
                                        }
                                    })}
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-px w-full my-3"></div>
                                <div className="flex justify-between font-semibold"><span className="text-gray-900">Total Paid</span><span className="text-gray-900">RM {openReceipt?.total_amount}</span></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-600">Payment Method</span><span className="text-gray-900">{openReceipt?.payment_method[0]?.method == "cash" ? "Cash" : "Credit/Debit"}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Date Paid</span><span className="text-gray-900">{openReceipt?.created_at ? moment(openReceipt?.created_at).format('dddd, MMMM D, YYYY') : "-"}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="text-green-600 font-medium">Paid</span></div>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4 no-print">
                                <Button className="bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex-1 border-gray-300 text-gray-700" variant="outline" onClick={() => window.print()}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                                <DialogClose className="bg-primary hover:bg-primary/90 h-9 rounded-md px-3 flex-1 border-gray-900 text-white">Close</DialogClose>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}