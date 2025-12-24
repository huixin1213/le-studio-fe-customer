
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Country {
	code: string;
	name: string;
	flag: string;
	dialCode: string;
}

const countries: Country[] = [
	{ code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
	// { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' }
];

interface PhoneInputProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	className?: string;
	defaultCountry?: string;
	readOnly?: boolean;
	required?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
	value = '',
	onChange,
	placeholder = 'Enter phone number',
	className,
	defaultCountry = 'MY',
	readOnly,
	required
}) => {
	const [selectedCountry, setSelectedCountry] = useState(
		countries.find(c => c.code === defaultCountry) || countries[0]
	);
	
	// Extract the phone number without country code
	const getPhoneNumber = (fullValue: string) => {
		if (!fullValue) return '';
			const dialCode = selectedCountry.dialCode;
		if (fullValue.startsWith(dialCode)) {
			return fullValue.substring(dialCode.length).trim();
		}
		return fullValue;
	};

	const phoneNumber = getPhoneNumber(value);

	const handleCountryChange = (countryCode: string) => {
		const country = countries.find(c => c.code === countryCode);
		if (country) {
			setSelectedCountry(country);
			const newValue = `${country.dialCode} ${phoneNumber}`.trim();
			onChange?.(newValue);
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value.replace(/\D/g, "");
		const newValue = inputValue ? `${selectedCountry.dialCode}${inputValue}` : '';
		onChange?.(newValue);
	};

	return (
		<div className={cn("flex", className)}>
		<Select value={selectedCountry.code} onValueChange={handleCountryChange}>
			<SelectTrigger className="w-[120px] rounded-r-none border-r-0">
				<SelectValue>
					<div className="flex items-center gap-2">
					<span className="text-lg">{selectedCountry.flag}</span>
					<span className="text-sm font-medium">{selectedCountry.dialCode}</span>
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent align="start">
			{countries.map((country) => (
				<SelectItem key={country.code} value={country.code}>
					<div className="flex items-center gap-2">
						<span className="text-lg">{country.flag}</span>
						<span>{country.name}</span>
						<span className="text-sm text-gray-500">{country.dialCode}</span>
					</div>
				</SelectItem>
			))}
			</SelectContent>
		</Select>
		<Input
			type="text"
			value={phoneNumber}
			onChange={handlePhoneChange}
			placeholder={placeholder}
			className="rounded-l-none flex-1"
			readOnly={readOnly}
			required={required}
		/>
		</div>
	);
};
