"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { Filter, Receipt, ArrowUpDown, Wallet, Calendar, Download, MapPin, User, Eye, Package, Star, ArrowUp, ArrowDown } from 'lucide-react';
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

type PackageHistory = {
    id: number;
    purchased_at: string;
    expiry_date: string;
    status_label: string;
    package: {
        package_item: {
            name: string;
        };
    };
};

export default function PackagesPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const apiStore = useApiStore();
    const [activePackageList, setActivePackageList] = useState<any[]>([]);
    // const [historyPackageList, setHistoryPackageList] = useState<any[]>([]);
    const [historyPackageList, setHistoryPackageList] = useState<{
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
    const [status, setStatus] = useState("all");
    const [openPackageDialog, setOpenPackageDialog] = useState(false);
    const [packageDetails, setPackageDetails] = useState<any>(null);
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
    const columns: ColumnDef<PackageHistory>[] = [
        {
            id: "package_name",
            accessorFn: row => row.package.package_item.name,
            header: ({ column }) => (
                <SortableHeader column={column} title="Package Name" />
            ),
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue<string>()}</span>
            ),
        },
        {
            accessorKey: "purchased_at",
            header: ({ column }) => (
                <SortableHeader column={column} title="Purchased Date" />
            ),
            cell: ({ row }) =>
                moment(row.original.purchased_at, "YYYY-MM-DD HH:mm:ss").format(
                    "DD MMM YYYY"
                ),
        },
        {
            accessorKey: "expiry_date",
            header: ({ column }) => (
                <SortableHeader column={column} title="Expiry Date" />
            ),
            cell: ({ row }) =>
                moment(row.original.expiry_date, "YYYY-MM-DD HH:mm:ss").format(
                    "DD MMM YYYY"
                ),
        },
        {
            accessorKey: "status_label",
            header: ({ column }) => (
                <SortableHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <Badge className={`${row.original.status_label === "Expired" ? "bg-gray-500" : "bg-green-500"} text-white capitalize`}>
                    {row.original.status_label}
                </Badge>
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
                        console.log("View package", row.original.id);  
                        fetchPackageDetails(row.original.id);
                        setOpenPackageDialog(true);
                    }}
                >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Details</span>
                </Button>
            ),
        },
    ];
    const table = useReactTable({
        data: historyPackageList.data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });


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

    async function fetchHistoryPackages(page: number = 1) {
        try {
            const sortField = sorting?.[0]?.id ?? "";
            const sortOrder = sorting?.[0]?.desc ? "desc" : "asc";

            const query = new URLSearchParams({
                transaction_date_from: startDate,
                transaction_date_to: endDate,
                status: status,
                sort: sortField,
                order: sortOrder,
                page: page.toString(),
            }).toString();

            const data = await apiStore.crudRequest({
                endpoint: `customer/package/history?${query}`,
                method: "GET",
            });

            // setHistoryPackageList(data.data);

            setHistoryPackageList({
                current_page: data.current_page,
                last_page: data.last_page,
                data: data.data,
                total: data.total,
            });
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
        fetchActivePackages();
        fetchHistoryPackages();
    }, []);

    useEffect(() => {
        fetchHistoryPackages();
    }, [sorting, startDate, endDate, status]);

    if (!mounted) return null;

    return (
        <>
            <PageTitle title="My Packages" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-primary animate-fade-in mb-4">Active Packages ({activePackageList && activePackageList.length})</h3>

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
                                                <Button 
                                                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" 
                                                    variant="outline"
                                                    onClick={() => {
                                                        fetchPackageDetails(item.id);
                                                        setOpenPackageDialog(true);
                                                    }}
                                                >
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

                <div className="max-w-full">
                    <h3 className="text-xl font-semibold text-primary mb-4 animate-fade-in">Package History</h3>

                    <Card className="p-0 gap-0">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-primary">
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
                                                No package history found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <div className="mt-4">
                                <Pagination
                                    totalPages={historyPackageList.last_page}
                                    currentPage={historyPackageList.current_page}
                                    onPageChange={fetchHistoryPackages}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
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
                                        <p className="font-semibold text-gray-900">{moment(`${packageDetails?.purchased_at}`, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY")}</p>
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