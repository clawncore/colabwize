import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "../../hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Shield, Smartphone, Loader2, CheckCircle, Copy, AlertTriangle, ArrowRight, ChevronRight } from "lucide-react";
import authService from "../../services/authService";
import { QRCodeSVG } from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface TwoFactorSetupProps {
    isEnabled: boolean;
    onStatusChange: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ isEnabled, onStatusChange }) => {
    const [step, setStep] = useState<'intro' | 'download' | 'qr' | 'backup'>('intro');
    const [secretData, setSecretData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    // Disable Flow
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");

    const handleStartSetup = () => {
        setStep('download');
    };

    const handleEnableClick = async () => {
        setLoading(true);
        try {
            const result = await authService.enable2FA();
            if (result.success && result.secret && result.qrCodeUrl) {
                setSecretData({ secret: result.secret, qrCodeUrl: result.qrCodeUrl });
                setStep('qr');
            } else {
                throw new Error(result.message || "Failed to start 2FA setup");
            }
        } catch (err: any) {
            console.error("2FA Setup Error:", err);
            toast({ title: "Setup Failed", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!code || code.length !== 6 || !secretData) return;
        setLoading(true);
        try {
            const result = await authService.confirm2FA(code, secretData.secret);
            if (result.success && result.backupCodes) {
                setBackupCodes(result.backupCodes);
                setStep('backup');
                onStatusChange();
                toast({ title: "Success", description: "2FA Enabled Successfully" });
            } else {
                throw new Error(result.message || "Invalid code");
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        setLoading(true);
        try {
            const result = await authService.disable2FA(disablePassword, disableCode);
            if (result.success) {
                setShowDisableModal(false);
                setDisablePassword("");
                setDisableCode("");
                onStatusChange();
                toast({ title: "Success", description: "2FA Disabled" });
            } else {
                throw new Error(result.message);
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (isEnabled) {
        return (
            <Card className="border-green-100 bg-green-50/10 transition-all hover:shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <CardTitle className="text-gray-900 text-xl">Two-Factor Authentication</CardTitle>
                            <CardDescription className="text-green-800 font-medium">Active & Protecting your account</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDisableModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow">
                            Disable 2FA
                        </Button>
                    </div>

                    <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
                        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50 shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-slate-50">Disable 2FA</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Enter your password and a code to confirm.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-200">Password</label>
                                    <Input
                                        type="password"
                                        value={disablePassword}
                                        onChange={e => setDisablePassword(e.target.value)}
                                        className="bg-white text-slate-900 border-slate-200 focus-visible:ring-slate-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-200">Authentication Code</label>
                                    <Input
                                        value={disableCode}
                                        onChange={e => setDisableCode(e.target.value)}
                                        maxLength={6}
                                        placeholder="000000"
                                        className="bg-white text-slate-900 border-slate-200 focus-visible:ring-slate-400 tracking-wider placeholder:tracking-normal"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDisableModal(false)}
                                    className="text-slate-300 hover:text-white hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDisable}
                                    disabled={loading || !disablePassword || !disableCode}
                                    className="bg-red-600 hover:bg-red-700 text-white border-none"
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Disable"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        );
    }

    // ENABLE FLOW
    return (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-gray-900 text-lg">Two-Factor Authentication</CardTitle>
                        <CardDescription>Secure your account in 3 simple steps.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <AnimatePresence mode='wait'>
                    {step === 'intro' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">Why enable 2FA?</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                            <span className="text-gray-600 text-sm">Protects against password theft</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                            <span className="text-gray-600 text-sm">Required for strict security zones</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                            <span className="text-gray-600 text-sm">Instant alerts on suspicious activity</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl"></div>

                                        {/* Mobile bouncing/floating */}
                                        <motion.div
                                            animate={{ y: [0, -12, 0] }}
                                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                            className="relative z-10 flex items-center justify-center"
                                        >
                                            <Smartphone className="w-40 h-40 text-blue-600" strokeWidth={1} />

                                            {/* Screen glow effect */}
                                            <div className="absolute inset-0 bg-blue-400/5 rounded-3xl blur-sm transform scale-x-75 scale-y-90"></div>

                                            {/* Shield appearing inside screen */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0, 1, 1, 0],
                                                    scale: [0.5, 1.2, 1, 0.5]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 3,
                                                    times: [0, 0.2, 0.8, 1],
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div className="bg-white p-2 rounded-full shadow-lg">
                                                    <Shield className="w-8 h-8 text-green-500 fill-green-100" />
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button onClick={handleStartSetup} className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all rounded-xl group">
                                    Start Setup <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'download' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">Step 1: Download Authenticator App</h3>
                                <p className="text-gray-500">Scan the QR code with your phone camera to download Google Authenticator.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                                        <QRCodeSVG value="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" size={120} />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Android</h4>
                                    <span className="text-xs text-gray-500 mb-3">Google Play Store</span>
                                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline font-medium">
                                        Direct Link
                                    </a>
                                </div>

                                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                                        <QRCodeSVG value="https://apps.apple.com/us/app/google-authenticator/id388497605" size={120} />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">iOS</h4>
                                    <span className="text-xs text-gray-500 mb-3">Apple App Store</span>
                                    <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline font-medium">
                                        Direct Link
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => setStep('intro')} className="text-gray-500 hover:text-gray-900">
                                    Back
                                </Button>
                                <Button onClick={handleEnableClick} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-xl text-base h-12 shadow-md hover:shadow-lg">
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                        <>I have the app <ArrowRight className="ml-2 w-4 h-4" /></>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'qr' && secretData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Step 2: Sync App</h3>
                                        <p className="text-gray-500 text-sm">Open Authenticator and scan this unique code.</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 inline-block">
                                        <img src={secretData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 mix-blend-multiply" />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manual Entry Key</p>
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <code className="flex-1 font-mono text-sm text-gray-800 break-all">{secretData.secret}</code>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => {
                                                navigator.clipboard.writeText(secretData.secret);
                                                toast({ title: "Copied", description: "Secret key copied!" });
                                            }}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 lg:border-l lg:border-gray-100 lg:pl-12">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Step 3: Verify</h3>
                                        <p className="text-gray-500 text-sm">Enter the 6-digit code displayed in your app to activate.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-center lg:justify-start">
                                            <Input
                                                value={code}
                                                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                maxLength={6}
                                                placeholder="000 000"
                                                className="text-center text-3xl tracking-[0.25em] font-bold font-mono h-20 w-full max-w-sm border-2 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-gray-200 placeholder:tracking-normal"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleConfirm}
                                            disabled={loading || code.length !== 6}
                                            className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-blue-200 transition-all"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Enable 2FA"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => setStep('download')} className="text-gray-500 hover:text-gray-900">
                                    Back to Downloads
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'backup' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center max-w-xl mx-auto space-y-8"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-gray-900">You're All Set!</h3>
                                <p className="text-gray-600">Your account is now more secure. When you sign in, you'll be required to enter a code from your authenticator app.</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-left shadow-sm">
                                <div className="flex items-center gap-3 mb-4 text-amber-900">
                                    <span className="text-xl">🔐</span>
                                    <h4 className="font-bold">Important: Keep it Secure</h4>
                                </div>
                                <div className="space-y-3 text-amber-900 text-sm leading-relaxed">
                                    <p>
                                        <strong>Backup Codes:</strong> Ensure you have saved your recovery codes in a safe place (like a password manager). These are the only way to access your account if you lose your phone.
                                    </p>
                                    <p>
                                        <strong>Lost Device:</strong> If you lose your device, use a backup code to login immediately and disable 2FA, then re-enable it on a new device.
                                    </p>
                                    <p>
                                        <strong>Don't Share:</strong> Never share your verification codes with anyone, even support agents.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 my-6">
                                    {backupCodes.map((c, i) => (
                                        <div key={i} className="bg-white border border-amber-200 rounded p-2 text-center font-mono text-sm text-gray-700 tracking-wider font-bold">
                                            {c}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full bg-white border-amber-300 text-amber-900 hover:bg-amber-100 mb-2"
                                    onClick={() => {
                                        navigator.clipboard.writeText(backupCodes.join("\n"));
                                        toast({ title: "Copied", description: "Backup codes copied to clipboard" });
                                    }}>
                                    <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                                </Button>
                            </div>

                            <Button
                                className="w-full h-12 text-lg rounded-xl bg-gray-900 hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all"
                                onClick={() => {
                                    setStep('intro');
                                    // Optionally refresh page or something if needed, but intro state checks props
                                }}>
                                Done
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
