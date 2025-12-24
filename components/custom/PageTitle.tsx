"use client";

import React from "react";

type PageTitleProps = {
    title: string;
    space?: string;
    caption?: string;
};

export default function PageTitle({
    title, space, caption
}: PageTitleProps) {
    return (
        <div className={`${space ? 'mb-'+space : 'mb-6 sm:mb-8'}`}>
            <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6`}>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            </div>
            {caption && (
                <p className="text-gray-600">{caption}</p>
            )}
        </div>
    );
}
