import React from "react";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface BillingStatusStripProps {
    status: "active" | "past_due" | "canceled" | "trialing";
    renewalDate?: Date | null;
    cancelDate?: Date | null;
    paymentMethod?: {
        brand: string;
        last4: string;
    } | null;
    planName?: string;
}

export const BillingStatusStrip: React.FC<BillingStatusStripProps> = ({
    status,
    renewalDate,
    cancelDate,
    paymentMethod,
    planName,
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case "active":
                return {
                    icon: CheckCircle,
                    label: "Active",
                    color: "border-l-green-500 bg-green-50/30",
                    badgeColor: "bg-green-100 text-green-700 border-green-200",
                };
            case "trialing":
                return {
                    icon: Clock,
                    label: "Trial",
                    color: "border-l-blue-500 bg-blue-50/30",
                    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
                };
            case "past_due":
                return {
                    icon: AlertCircle,
                    label: "Past Due",
                    color: "border-l-red-500 bg-red-50/30",
                    badgeColor: "bg-red-100 text-red-700 border-red-200",
                };
            case "canceled":
                return {
                    icon: XCircle,
                    label: cancelDate
                        ? `Cancels on ${cancelDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : "Canceled",
                    color: "border-l-orange-500 bg-orange-50/10",
                    badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
                };
            default:
                return {
                    icon: CheckCircle,
                    label: "Active",
                    color: "border-l-green-500 bg-green-50/30",
                    badgeColor: "bg-green-100 text-green-700 border-green-200",
                };
        }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
        <Card className={`border-l-4 ${config.color} shadow-sm`}>
            <CardContent className="flex items-center justify-between py-4 px-6">
                <div className="flex items-center gap-3">
                    <Badge
                        variant="outline"
                        className={`${config.badgeColor} font-medium flex items-center gap-1 px-2 py-0.5 text-xs`}
                    >
                        <StatusIcon className="h-3 w-3" />
                        <span>{config.label}</span>
                    </Badge>

                    {planName && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                            <span className="text-sm font-bold text-gray-800">
                                {planName}
                            </span>
                        </div>
                    )}

                    <div className="h-4 w-px bg-gray-300 mx-2"></div>

                    {renewalDate && (
                        <div className="text-sm text-gray-700">
                            <span className="font-medium text-gray-900">Renews:</span>{" "}
                            {renewalDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                    )}

                    {paymentMethod && (
                        <div className="text-sm text-gray-700">
                            <span className="font-medium text-gray-900">Payment:</span>{" "}
                            {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} ending ••
                            {paymentMethod.last4}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
