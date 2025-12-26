"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiStore } from "@/stores/useApi";
import { useUser } from "@/stores/useUser";
import Cookies from "js-cookie";
import Link from "next/link";
import { UserPlus, UserCheck, ArrowLeft, EyeOff, Eye, Sparkles } from 'lucide-react';
import { toast } from "sonner";
import { PhoneInput } from '@/components/custom/PhoneInput';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Arrow } from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FormData = {
    mobile_no: string | null;
    email: string | null;
    password: string | null;
    password_confirmation: string | null;
    name: string | null;
    gender: string | null;
    race: string | null;
    other_race?: string | null;
    referral_source: string | null;
};

export default function SignupPage() {
    const router = useRouter();
    const apiStore = useApiStore();
    const [formData, setFormData] = useState<FormData>({
        mobile_no: null,
        email: null,
        password: null,
        password_confirmation: null,
        name: null,
        gender: null,
        race: null,
        other_race: null,
        referral_source: null,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);
    const [referralSource, setReferralSource] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const data = await apiStore.crudRequest({
                endpoint: `customer/register`,
                method: "POST",
                body: formData,
                authRequired: false
            });

            console.log(data)

            if ( data.token ) {
                // store token in cookie
                Cookies.set("token", data.token, { expires: 7 });

                // store user in Zustand
                useUser.getState().setUser(data.user, data.token);

                router.push("/dashboard");
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
        <div className="flex items-center w-full justify-center">
            <div className="w-full max-w-sm sm:max-w-md py-6">
                <div className="mb-4 flex items-center">
                    <Link href="/login">
                        <Button className="bg-transparent h-10 px-4 py-2 flex items-center gap-2 text-primary hover:bg-accent hover:text-accent-foreground">
                            <ArrowLeft className="h-5 w-5" />
                            Back
                        </Button>
                    </Link>
                </div>
                <div className="text-center mb-6 sm:mb-8">
                    <div className="bg-primary p-3 rounded-full w-fit mx-auto mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Join LE CLASSIC</h2>
                    <p className="text-gray-600 text-lg">Discover your true beauty and elevate your style.</p>
                </div>
                <div className="rounded-lg text-card-foreground shadow-sm border border-gray-200 bg-white">
                    <div className="flex flex-col space-y-1.5 p-6 text-center pb-4 sm:pb-6 px-4 sm:px-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create Account</h2>
                    </div>
                    <div className="p-6 pt-0 space-y-4 sm:space-y-6 px-4 sm:px-6">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="relative">
                                    {/* <input name="mobile_no" type="text" placeholder="Mobile No" required className="border p-2 w-full" /> */}
                                    <PhoneInput className="bg-white" value={formData.mobile_no ?? ""} onChange={(value) => setFormData((prev) => ({ ...prev, mobile_no: value }))} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Email Address</label>
                                <Input name="email" type="email" placeholder="e.g. your@email.com" value={formData.email ?? ""} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required className="border p-2 w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Password</label>
                                <div className="relative">
                                    <Input 
                                        name="password" 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password" 
                                        value={formData.password ?? ""} 
                                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} 
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
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Confirm Password</label>
                                <div className="relative">
                                    <Input 
                                        name="password_confirmation" 
                                        type={showConfirmationPassword ? "text" : "password"}
                                        placeholder="Re-enter password" 
                                        value={formData.password_confirmation ?? ""} 
                                        onChange={(e) => setFormData((prev) => ({ ...prev, password_confirmation: e.target.value }))} 
                                        required 
                                        className="border p-2 w-full" 
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                        onClick={() =>
                                        setShowConfirmationPassword(!showConfirmationPassword)}
                                    >
                                        {showConfirmationPassword ? 
                                        <EyeOff className="h-4 w-4" />
                                        : 
                                        <Eye className="h-4 w-4" />
                                        }
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Full Name</label>
                                <Input name="name" type="text" placeholder="e.g. John Tan" value={formData.name ?? ""} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required className="border p-2 w-full" />
                            </div>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Gender</label>
                                <Select 
                                    value={formData.gender ?? ""}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            gender: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full bg-white cursor-pointer">
                                        <SelectValue placeholder="Select your gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Race</label>
                                <Select 
                                    value={formData.race ?? ""}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            race: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full bg-white cursor-pointer">
                                        <SelectValue placeholder="Select your race" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="malay">Malay</SelectItem>
                                        <SelectItem value="chinese">Chinese</SelectItem>
                                        <SelectItem value="indian">Indian</SelectItem>
                                        <SelectItem value="foreigner">Foreigner</SelectItem>
                                        <SelectItem value="others">Others (please specify)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.race == "others" && (
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Please specify other race</label>
                                    <Input name="other_race" type="text" placeholder="Please specify" value={formData.other_race ?? ""} onChange={(e) => setFormData((prev) => ({ ...prev, other_race: e.target.value }))} required className="border p-2 w-full bg-white" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >How did you hear about LE CLASSIC?</label>
                                <Select 
                                    value={referralSource ?? ""}
                                    onValueChange={(value) => {
                                        setReferralSource(value);
                                        if ( value != "others" ) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                referral_source: value,
                                            }))
                                        } else {
                                            setFormData((prev) => ({
                                                ...prev,
                                                referral_source: "",
                                            }))
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-white cursor-pointer">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="Instagram">Instagram</SelectItem>
                                        <SelectItem value="TikTok">TikTok</SelectItem>
                                        <SelectItem value="Rednote">Rednote</SelectItem>
                                        <SelectItem value="X (Twitter)">X (Twitter)</SelectItem>
                                        <SelectItem value="YouTube">YouTube</SelectItem>
                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                        <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                                        <SelectItem value="Google">Google</SelectItem>
                                        <SelectItem value="Walk-in / Physical Store">Walk-in / Physical Store</SelectItem>
                                        <SelectItem value="Event">Event</SelectItem>
                                        <SelectItem value="Influencer / KOL">Influencer / KOL</SelectItem>
                                        <SelectItem value="Magazine / Newspaper">Magazine / Newspaper</SelectItem>
                                        <SelectItem value="Website / Blog">Website / Blog</SelectItem>
                                        <SelectItem value="others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {referralSource == "others" && (
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" >Please specify other source</label>
                                    <Input name="referral_source" type="text" placeholder="Please specify" value={formData.referral_source ?? ""} onChange={(e) => setFormData((prev) => ({ ...prev, referral_source: e.target.value }))} required className="border p-2 w-full bg-white" />
                                </div>
                            )}
                            <Button className="px-4 py-2 w-full h-10 sm:h-12 bg-primary hover:bg-primary text-white font-medium rounded-lg shadow-sm transition-all duration-200" type="submit">
                                <Sparkles className="h-4 w-4" />
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?
                                <Link className="text-primary hover:text-gray-800 font-medium transition-colors" href="/login"> Sign in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
