"use client";

import { useEffect, useState } from "react";
import { useApiStore } from "@/stores/useApi";
import { useUser } from "@/stores/useUser";
import Cookies from "js-cookie";
import { Eye, EyeOff, UserCheck } from 'lucide-react';
import { toast } from "sonner";
import { PhoneInput } from '@/components/custom/PhoneInput';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const apiStore = useApiStore();
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/login`,
                method: "POST",
                body: {mobile_no: mobileNumber, password: password},
                authRequired: false
            });

            if ( data.token ) {
                // store token in cookie
                Cookies.set("token", data.token, { expires: 7 });

                // store user in Zustand
                useUser.getState().setUser(data.customer, data.token);

                window.location.href = "/dashboard";
            } else {
                toast(data.message);
            }
        } catch (err: any) {
            toast(err.message);
            // setError(err.message);
        }
    }

    const { user } = useUser();

    return (
        <div className="flex items-center w-full h-screen justify-center">
            <div className="w-full max-w-sm sm:max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    {/* <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                        <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div> */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">LE CLASSIC</h1>
                </div>
                <div className="rounded-lg text-card-foreground shadow-sm border border-gray-200 bg-white">
                    <div className="flex flex-col space-y-1.5 p-6 text-center pb-4 sm:pb-6 px-4 sm:px-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Sign in to your account</p>
                    </div>
                    <div className="p-6 pt-0 space-y-4 sm:space-y-6 px-4 sm:px-6">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="relative">
                                    {/* <input name="mobile_no" type="text" placeholder="Mobile No" required className="border p-2 w-full" /> */}
                                    <PhoneInput className="bg-white" value={mobileNumber ?? ""} onChange={(value) => setMobileNumber(value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Password</label>
                                <div className="relative">
                                    <Input 
                                        name="password" 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password" 
                                        value={password ?? ""} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        className="border p-2 w-full"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                        onClick={() =>
                                        setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 
                                        <EyeOff className="h-4 w-4" />
                                        : 
                                        <Eye className="h-4 w-4" />
                                        }
                                    </Button>
                                </div>
                            </div>
                            <Button className="px-4 py-2 w-full h-10 sm:h-12 bg-primary hover:bg-primary text-white font-medium rounded-lg shadow-sm transition-all duration-200" type="submit">Login</Button>
                        </form>

                        <div className="mt-6 space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or</span>
                                </div>
                            </div>
                            <a href="booking">
                                <Button className="border bg-background h-10 px-4 py-2 w-full border-primary text-primary hover:bg-primary hover:text-white">
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Continue as Guest
                                </Button>
                            </a>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account? 
                                <a className="text-primary hover:text-gray-800 font-medium transition-colors" href="/signup"> Sign up</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
