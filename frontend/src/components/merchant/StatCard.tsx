import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    description?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp, description }: StatCardProps) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={clsx(
                    "p-2 sm:p-3 rounded-2xl",
                    trendUp === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#1B5E20]'
                )}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-[8px] sm:text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full",
                        trendUp === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-[8px] sm:text-sm font-black uppercase tracking-widest">{title}</p>
                <h3 className="text-sm sm:text-2xl font-black text-gray-900 mt-1">{value}</h3>
                {description && (
                    <p className="text-[7px] sm:text-xs text-gray-400 font-medium mt-2">{description}</p>
                )}
            </div>
        </div>
    );
}
