import React from "react";
import { CreditCard, Clock, Activity } from "lucide-react";
import { format } from "date-fns";

interface CreditTransaction {
    id: string;
    amount: number;
    type: string;
    description?: string;
    created_at: string;
}

interface CreditUsageHistoryProps {
    transactions: CreditTransaction[];
}

export const CreditUsageHistory: React.FC<CreditUsageHistoryProps> = ({ transactions }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    Credit History
                </h3>
            </div>

            <div className="overflow-x-auto">
                {transactions.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Clock className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-medium">No credit activity yet</p>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                            Actions performed using credits will be listed here.
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Activity</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">Credits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                                        {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        <div className="flex items-center gap-2">
                                            {tx.type === "PURCHASE" ? (
                                                <CreditCard className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Activity className="h-4 w-4 text-blue-500" />
                                            )}
                                            <span className="capitalize">{tx.description || tx.type.toLowerCase()}</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-medium ${tx.type === 'PURCHASE' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {tx.type === 'PURCHASE' ? '+' : '-'}{Math.abs(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
