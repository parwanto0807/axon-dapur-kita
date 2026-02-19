export const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (date: string | Date | number): string => {
    if (!date) return '-';

    // Convert to Date object if needed
    const d = new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
        timeZoneName: 'short'
    }).format(d);
};

export const formatShortDate = (date: string | Date | number): string => {
    if (!date) return '-';

    const d = new Date(date);

    if (isNaN(d.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(d);
}
