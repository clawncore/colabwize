import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { ShieldCheck, Lock } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";

interface CheckoutNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function CheckoutNoticeModal({ isOpen, onClose, onConfirm, isLoading }: CheckoutNoticeModalProps) {
    const [accepted, setAccepted] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Lock className="h-5 w-5 text-green-600" />
                        Secure Checkout Notice
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-gray-600 font-medium">
                        Before proceeding to payment, please review the following:
                    </p>

                    <div className="flex gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p>Payments are securely processed by <strong>Lemon Squeezy</strong>.</p>
                    </div>

                    <div className="flex gap-2">
                        <ShieldCheck className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p>ColabWize <strong>does not</strong> store or see your credit card details.</p>
                    </div>

                    <div className="flex gap-2">
                        <ShieldCheck className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p>Subscriptions are <strong>non-refundable</strong> due to immediate access.</p>
                    </div>
                </div>

                <div className="text-xs text-gray-500 flex gap-2 justify-center py-2">
                    <a href="/legal/privacy" target="_blank" className="underline hover:text-blue-600">Privacy Policy</a>
                    <span>•</span>
                    <a href="/legal/terms" target="_blank" className="underline hover:text-blue-600">Terms of Service</a>
                    <span>•</span>
                    <a href="/legal/refund-policy" target="_blank" className="underline hover:text-blue-600">Refund Policy</a>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                    <Checkbox
                        id="terms"
                        checked={accepted}
                        onCheckedChange={(checked) => setAccepted(checked === true)}
                    />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        I have read and agree to the <a href="/legal/refund-policy" target="_blank" className="text-blue-600 underline">Refund Policy</a>, <a href="/legal/terms" target="_blank" className="text-blue-600 underline">Terms of Service</a>, and <a href="/legal/privacy" target="_blank" className="text-blue-600 underline">Privacy Policy</a>.
                    </label>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={!accepted || isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLoading ? "Processing..." : "Continue to Secure Checkout"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
