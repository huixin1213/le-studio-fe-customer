export interface CalendarCell<T = any> {
    day: number;
    isOtherMonth?: boolean;
    data?: T | null;
}

/**
 * Build calendar grid (Monday start)
 * Generic and reusable for schedules, bookings, etc.
 */
export function buildCalendar<T extends { date: string }>(
    year: number,
    month: number,
    items: T[] = []
): CalendarCell<T>[][] {
    const weeks: CalendarCell<T>[][] = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Convert JS Sunday(0) → Monday(0)
    const offset = (firstDayOfMonth.getDay() + 6) % 7;

    let dayCounter = 1;

    while (dayCounter <= daysInMonth) {
        const week: CalendarCell<T>[] = [];

        for (let d = 0; d < 7; d++) {
            // Previous month
            if (weeks.length === 0 && d < offset) {
                const prevMonthDays = new Date(year, month - 1, 0).getDate();
                week.push({
                    day: prevMonthDays - offset + d + 1,
                    isOtherMonth: true,
                });
            }
            // Next month
            else if (dayCounter > daysInMonth) {
                week.push({
                    day: dayCounter - daysInMonth,
                    isOtherMonth: true,
                });
                dayCounter++;
            }
            // Current month
            else {
                const date = `${year}-${String(month).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;

                const data = items.find((item) => item.date === date) ?? null;

                week.push({
                    day: dayCounter,
                    data,
                });

                dayCounter++;
            }
        }

        weeks.push(week);
    }

    return weeks;
}
