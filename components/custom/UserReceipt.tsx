"use client";

import { useEffect, useState } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { MapPin, User, Calendar, Download } from 'lucide-react';
import moment from "moment-timezone";
import { Button } from "@/components/ui/button";

interface UserReceiptProps {
    openReceipt?: any;
}

export default function UserReceipt({
    openReceipt,
}: UserReceiptProps) {
    return (
        <>
            {openReceipt && (
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
                                        return transaction.consumed_service ? (
                                            <div key={index}>
                                                {(transaction.price && (Number(transaction.price) > 0)) ? (
                                                    <div className="flex justify-between text-sm"><span className="text-gray-600">{transaction.item?.package_item?.name}</span><span className="text-gray-900 font-medium">RM {transaction.item?.package_item?.price}</span></div>
                                                ) : (null)}
                                                <div className="flex justify-between text-sm"><span className="text-gray-600">{transaction.consumed_service.service_item.name} (Package)</span><span className="text-gray-900 font-medium line-through">RM {transaction.consumed_service.service_item.price}</span></div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between text-sm" key={index}><span className="text-gray-600">{transaction.item?.package_item?.name}</span><span className="text-gray-900 font-medium">RM {transaction.item?.package_item?.price}</span></div>
                                        )
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
                        {/* <div className="flex justify-between font-semibold"><span className="text-gray-900">Total Paid</span><span className="text-gray-900">RM {openReceipt?.total_amount}</span></div> */}
                        <div className="space-y-1">
                            {openReceipt.credit_spent && Number(openReceipt.credit_spent) > 0 ? (
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Points Redeemed</span><span className="text-gray-900">- RM {openReceipt.credit_spent}</span></div>
                            ) : null}
                            
                            {openReceipt.discount && Number(openReceipt.discount) > 0 ? (
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Discount</span><span className="text-gray-900">- RM {openReceipt.discount}</span></div>
                            ) : null}

                            {openReceipt?.voucher_used && openReceipt.voucher_used.length > 0 ? (
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Voucher Discount</span><span className="text-gray-900">- RM {(openReceipt.voucher_used).reduce((sum: number, s: any) => sum + parseFloat(s.customer_voucher.value), 0)}</span></div>
                            ) : null}

                            <div className="flex justify-between font-semibold"><span className="text-gray-900">Total Paid</span><span className="text-gray-900">RM {openReceipt.total_amount}</span></div>
                        </div>
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
            )}
        </>
    );
}
