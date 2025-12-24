"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

interface CustomerPaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function CustomerPagination({
    totalPages,
    currentPage,
    onPageChange,
}: CustomerPaginationProps) {
    const generatePages = (total: number, current: number) => {
        const delta = 1;
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];
        let last: number | undefined;

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (last !== undefined) {
                if ((i as number) - last === 2) {
                    rangeWithDots.push(last + 1);
                } else if ((i as number) - last > 2) {
                    rangeWithDots.push("ellipsis");
                }
            }
            rangeWithDots.push(i);
            last = i as number;
        }

        return rangeWithDots;
    };

    const pages = generatePages(totalPages, currentPage);

    // Hide pagination if only 1 page
    // if (totalPages <= 1) return null;

    return (
        <Pagination>
            <PaginationContent className="select-none">
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {pages.map((page, i) => (
                    <PaginationItem key={i}>
                        {page === "ellipsis" ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                aria-disabled={page === currentPage}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page !== currentPage) onPageChange(Number(page));
                                }}
                                className={
                                    page === currentPage
                                        ? "pointer-events-none cursor-default"
                                        : ""
                                }
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={() =>
                            currentPage < totalPages && onPageChange(currentPage + 1)
                        }
                        aria-disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
