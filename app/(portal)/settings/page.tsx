"use client";

import { Button } from "@/components/ui/button";
import { PhoneInput } from '@/components/custom/PhoneInput';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { toast } from "sonner";
import Link from "next/link";

type FormData = {
    name: string | null;
    email: string | null;
    mobile_no: string | null;
};

type PasswordFormData = {
    current_password: string | null;
    new_password: string | null;
    new_password_confirmation: string | null;
};

export default function SettingPage() {
    const apiStore = useApiStore();
    const [formData, setFormData] = useState<FormData>({
        name: null,
        email: null,
        mobile_no: null,
    });
    const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
        current_password: null,
        new_password: null,
        new_password_confirmation: null,
    });
    const [selectedMenu, setSelectedMenu] = useState("profile");
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function fetchProfile() {
        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/profile`,
                method: "GET",
            });

            setFormData((prev) => ({
                ...prev,

                name: data.name,
                email: data.email,
                mobile_no: data.mobile_no.replace('+60', ''),
            }));

            // setBookingData(data || []);
        } catch (err) {
            // console.error(err);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const submitData = Object.fromEntries(
                Object.entries(formData)
                    .filter(([_, v]) => v != null && v !== "")
                    .map(([k, v]) => {
                    if (k === "mobile_no") {
                        const value = String(v);

                        return [
                        k,
                        value.startsWith("+60") ? value : `+60${value}`,
                        ];
                    }

                    return [k, v];
                    })
            );

            const data = await apiStore.crudRequest({
                endpoint: `customer/profile`,
                method: "POST",
                body: submitData
            });

            toast(data.message);
        } catch (err: any) {
        }
    };

    async function handlePasswordChange() {
        if ( passwordFormData.new_password !== passwordFormData.new_password_confirmation ) {
            toast("The new password field confirmation does not match.csz");

            return;
        }

        try {
            const submitData = Object.fromEntries(
                Object.entries(passwordFormData).filter(([_, v]) => v != null && v !== "")
            );

            const data = await apiStore.crudRequest({
                endpoint: `customer/change-password`,
                method: "POST",
                body: submitData
            });

            toast(data.message);
        } catch (err: any) {
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your profile, security, and notification preferences</p>
                </div>
            </div>
            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="rounded-lg text-card-foreground shadow-sm bg-white">
                        <div className="p-0">
                            <div className="space-y-1 p-4">
                                <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${selectedMenu == "profile" ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100 bg-transparent'}`} onClick={() => setSelectedMenu("profile")}>
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">Profile</span>
                                </button>
                                <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${selectedMenu == "security" ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100 bg-transparent'}`} onClick={() => setSelectedMenu("security")}>
                                    <Lock className="h-5 w-5" />
                                    <span className="font-medium">Security</span>
                                </button>
                                <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${selectedMenu == "notifications" ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100 bg-transparent'}`} onClick={() => setSelectedMenu("notifications")}>
                                    <Bell className="h-5 w-5" />
                                    <span className="font-medium">Notifications</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <div className="rounded-lg text-card-foreground shadow-sm bg-white">
                        <div className="p-8">
                            {selectedMenu == "profile" && (
                                <div className="space-y-8">
                                    <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                                            <User className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                                            <p className="text-gray-600">Manage your personal information</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                                            <div className="space-y-2">
                                                <Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Full Name</Label>
                                                <Input className="py-2" id="fullName" placeholder="John Doe" value={formData.name ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Email Address</Label>
                                                <Input type="email" className="py-2" id="email" placeholder="john@example.com" value={formData.email ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Phone Number</Label>
                                                <PhoneInput className="bg-white" value={formData.mobile_no ?? ""} onChange={(value) => setFormData(prev => ({ ...prev, mobile_no: value }))} />
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <Button className="text-primary-foreground h-10 px-4 py-2 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105">Update Profile</Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {selectedMenu == "security" && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                                            <Lock className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                                            <p className="text-gray-600">Manage your password and security preferences</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 animate-fade-in">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-primary text-left">Change Password</h3>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                // value={currentPassword}
                                                // onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter your current password"
                                                className="h-11 pr-10"
                                                value={passwordFormData.current_password ?? ""} 
                                                onChange={(e) => setPasswordFormData(prev => ({ ...prev, current_password: e.target.value }))}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                                onClick={() =>
                                                setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? 
                                                <EyeOff className="h-4 w-4" />
                                                : 
                                                <Eye className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                // value={newPassword}
                                                // onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter your new password"
                                                className="h-11 pr-10"
                                                value={passwordFormData.new_password ?? ""} 
                                                onChange={(e) => setPasswordFormData(prev => ({ ...prev, new_password: e.target.value }))}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                                onClick={() =>
                                                setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? 
                                                <EyeOff className="h-4 w-4" />
                                                : 
                                                <Eye className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                // value={confirmPassword}
                                                // onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm your new password"
                                                className="h-11 pr-10"
                                                value={passwordFormData.new_password_confirmation ?? ""} 
                                                onChange={(e) => setPasswordFormData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                                onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? 
                                                <EyeOff className="h-4 w-4" />
                                                : 
                                                <Eye className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            onClick={handlePasswordChange}
                                            disabled={!passwordFormData.current_password || !passwordFormData.new_password || !passwordFormData.new_password_confirmation}
                                            className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 text-white px-8"
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedMenu == "notifications" && (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                                            <Bell className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                                            <p className="text-gray-600">Manage how you receive notifications</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            onClick={handlePasswordChange}
                                            disabled={!passwordFormData.current_password || !passwordFormData.new_password || !passwordFormData.new_password_confirmation}
                                            className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 text-white px-8"
                                        >
                                            Save Preferences
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
