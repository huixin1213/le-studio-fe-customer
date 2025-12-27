"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApiStore } from "@/stores/useApi";
import { X, Calendar, Bell, Lock, User, ShoppingCart, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment-timezone";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function UserNotification() {
    const router = useRouter();
    const apiStore = useApiStore();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
    const [notificationList, setNotificationList] = useState<{
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
    const [loadingMoreNotification, setLoadingMoreNotification] = useState(false);

    async function fetchNotificationCount() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/notification/count`,
                method: "GET",
            });

            if (data && data.unread_count) {
                setNotificationUnreadCount(data.unread_count);
            }
        } catch (err: any) {
            // console.log(err)
        }
    }

    async function fetchNotificationList(page: number = 1) {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/notification?page=${page}`,
                method: "GET",
            });

            if (page > 1) {
                setNotificationList(prev => ({
                    ...prev,
                    current_page: data.current_page,
                    last_page: data.last_page,
                    data: [...(prev?.data || []), ...data.data],
                }));
            } else {
                setNotificationList(prev => ({
                    ...prev,
                    current_page: data.current_page,
                    last_page: data.last_page,
                    data: data.data
                }));
            }

            fetchNotificationCount();
        } catch (err: any) {
            // console.log(err)
        }
    }

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = target;

        if (loadingMoreNotification) return;

        const { current_page, last_page } = notificationList;
        if (current_page >= last_page) return;

        if (scrollTop + clientHeight >= scrollHeight - 50) {
            setLoadingMoreNotification(true);
            await fetchNotificationList(current_page + 1);
            setLoadingMoreNotification(false);
        }
    };

    useEffect(() => {
        fetchNotificationCount();
        fetchNotificationList();
    }, []);

    function renderNotificationIcon(type: string) {
        switch (type) {
            case "AccountSettingNotification":
                return <User className="h-4 w-4 text-blue-500" />;
            case "BookingNotification":
                return <Calendar className="h-4 w-4 text-blue-500" />;
            case "CheckoutNotification":
                return <ShoppingCart className="h-4 w-4 text-blue-500" />;
            case "PackagesNotification":
                return <Package className="h-4 w-4 text-blue-500" />;
            case "TopupNotification":
                return <CreditCard className="h-4 w-4 text-blue-500" />;
            default:
                return null;
        }
    }

    function renderNotificationContent(notification: any, index: number) {
        const notificationType = (notification.type).replace('App\\Notifications\\', '');
        const notificationDataType = notification.data.type;
        const notificationData = notification.data;
        const notificationReadAt = notification.read_at;
        const notificationMoment = moment(notification.created_at);
        const diffDays = moment().diff(notificationMoment, "days");
        const diffHours = moment().diff(notificationMoment, "hours");
        let notificationTimeAgo = "";

        console.log('notificationReadAt', notificationReadAt);

        if (diffDays >= 1) {
            notificationTimeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        } else if (diffHours >= 1) {
            notificationTimeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else {
            notificationTimeAgo = "less than 1 hour ago";
        }

        function renderCard(title: string, message: React.ReactNode | string) {
            return (
                <div className={`p-3 border rounded-lg transition-colors cursor-pointer ${!notificationReadAt ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`} key={index}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                            {renderNotificationIcon(notificationType)}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 text-sm truncate">{title}</h4>
                                    {/* <div className="w-2 h-2 rounded-full bg-red-500"></div> */}
                                </div>
                                <p className="text-sm text-gray-600">{message}</p>
                                <p className="text-xs text-gray-400 mt-1">{notificationTimeAgo}</p>
                            </div>
                        </div>
                        {/* <Button className="bg-transparent hover:bg-accent h-9 rounded-md text-gray-400 hover:text-red-500 p-1">
                            <X className="h-3 w-3" />
                        </Button> */}
                    </div>
                </div>
            );
        }

        switch (notificationType) {
            case "AccountSettingNotification":
                const changedFields = notificationData.changeFields;

                switch (notificationDataType) {
                    case "change_password_fail":
                        return renderCard(
                            "Password Change Failed",
                            "Password change attempt failed. Please try again or contact support if you need assistance."
                        );
                    case "change_password_success":
                        return renderCard(
                            "Password Updated",
                            "Your password has been changed successfully. If you did not make this change, please contact us immediately."
                        );
                    case "profile_update":
                        return renderCard(
                            "Profile Updated",
                            <>
                                Your account information has been updated successfully.
                                {changedFields && changedFields.length > 0 && <> Changes: {changedFields.join(', ')}.</>}
                            </>
                        );
                    default:
                        return null;
                }
            case "BookingNotification":
                const bookingId = notificationData.booking_id;
                const bookingDate = notificationData.booking_date;
                const bookingTime = notificationData.booking_time;
                const bookingService = notificationData.booking_service;
                const stylistName = notificationData.stylist_name;
                const customerName = notificationData.customer_name;
                const branchName = notificationData.branch_name;

                switch (notificationDataType) {
                    case "booking_create":
                        return renderCard(
                            "Booking Confirmed",
                            <>Your booking is confirmed! "{bookingService}" on "{bookingDate}" at "{bookingTime}" with "{stylistName}" at "{branchName}".</>
                        );
                    case "booking_edit":
                        return renderCard(
                            "Booking Updated",
                            <>Your booking for {bookingService} has been updated. Please review the new details for {bookingDate} at {bookingTime} with {stylistName} at {branchName}.</>
                        );
                    case "booking_reminder":
                        return renderCard(
                            "Booking Reminder",
                            <>Reminder: Your appointment is in 2 hours. {bookingService} at {bookingTime} with {stylistName} at {branchName}.</>
                        );
                    case "booking_check_in":
                        return renderCard(
                            "Checked In Successfully",
                            <>You have successfully checked in for your {bookingService} appointment at {branchName}. We’ll be with you shortly.</>
                        );
                    case "booking_cancelled":
                        return renderCard(
                            "Booking Cancelled",
                            <>Your booking {bookingService} for {bookingDate} at {bookingTime} has been cancelled. We hope to see you again soon!</>
                        );
                    case "booking_no_show":
                        return renderCard(
                            "Missed Appointment",
                            <>Your booking for {bookingService} on {bookingDate} at {bookingTime} was marked as a no-show. If this was a mistake, please contact us. We hope to see you again soon.</>
                        );
                    default:
                        return null;
                }
            case "CheckoutNotification":
                const transactionId = notificationData.transaction_id;
                const transactionAmount = Number(notificationData.amount) % 1 === 0 ? notificationData.amount : Number(notificationData.amount).toFixed(2);
                if (notificationDataType === "checkout_success") {
                    return renderCard(
                        "Payment Successful",
                        <>Payment successful! Transaction #{transactionId} - Amount: {transactionAmount}. Thank you!</>
                    );
                }
                return null;
            case "PackagesNotification":
                const packagesId = notificationData.packages_id;
                const packagesName = notificationData.packages_name;
                const remainingSessions = notificationData.remaining_sessions;
                const expiryDate = moment(notificationData.expiry_date).format("DD-MMM-YYYY");

                switch (notificationDataType) {
                    case "redeemed_package":
                        return renderCard(
                            "Package Redeemed",
                            <>Package redeemed: {packagesName}. {remainingSessions} sessions remaining.</>
                        );
                    case "purchased_package":
                        return renderCard(
                            "Package Purchased",
                            <>Package purchased successfully! {packagesName} is now active in your account. Thank you!</>
                        );
                    case "package_reminder":
                        return renderCard(
                            "Package Expiring Soon",
                            <>Your package {packagesName} will expire on {expiryDate}. Book now to use your remaining sessions!</>
                        );
                    default:
                        return null;
                }
            case "TopupNotification":
                const balance = Number(notificationData.balance) % 1 === 0 ? notificationData.balance : Number(notificationData.balance).toFixed(2);
                const topupAmount = Number(notificationData.amount) % 1 === 0 ? notificationData.amount : Number(notificationData.amount).toFixed(2);
                
                switch (notificationDataType) {
                    case "redeemed_topup":
                        return renderCard(
                            "Top-Up Used",
                            <>Top-up redeemed: {(topupAmount)} deducted. Current balance: {(balance)}.</>
                        );
                    case "purchased_topup":
                        return renderCard(
                            "Top-Up Successful",
                            <>Top-up successful! {(topupAmount)} has been added to your account. New balance: {(balance)}.</>
                        );
                    default:
                        return null;
                }
            default:
                return null;
        }
    }

    return (
        <Popover
            onOpenChange={(open) => {
                if (!open) {
                    fetchNotificationCount();
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button className="bg-transparent rounded-md h-8 w-8 p-0 hover:bg-gray-100 shrink-0 relative">
                    <Bell className="h-4 w-4 text-gray-600" />
                    {notificationUnreadCount > 0 && (
                        <Badge
                            className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums absolute -top-1.5 -right-1.5 text-xs flex items-center justify-center"
                            variant="destructive"
                        >
                            {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-1 bg-white rounded-xl shadow-2xl border w-full max-w-md sm:w-[400px] sm:max-w-md mx-auto" align="end">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b">
                    <div className="flex items-center gap-2 text-salon-primary font-bold text-lg">
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                        {notificationUnreadCount > 0 && (
                            <Badge className="hover:bg-primary/80 bg-red-500 text-white text-xs px-2.5 py-0.5">{notificationUnreadCount}</Badge>
                        )}
                    </div>
                </div>
                
                <div className="p-4">
                    <ScrollArea className="max-h-[65vh]">
                        <div
                            ref={scrollRef}
                            className="space-y-3"
                            onScroll={(e) => handleScroll(e)}
                            style={{ overflowY: 'auto', maxHeight: '65vh' }}
                        >
                            {notificationList.data.map((notification: any, index: number) =>
                                renderNotificationContent(notification, index)
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}
