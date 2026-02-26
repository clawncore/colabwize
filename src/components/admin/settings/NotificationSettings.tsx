"use client";

import React, { useState, useEffect } from "react";
import {
    Bell,
    Mail,
    Smartphone,
    Clock,
    Shield,
    Zap,
    Target,
    Users,
} from "lucide-react";
import NotificationService, { NotificationSettings as Settings } from "../../../services/notificationService";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Skeleton } from "../../ui/skeleton";
import { useToast } from "../../../hooks/use-toast";

const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await NotificationService.getSettings();
                setSettings(data);
            } catch (err) {
                console.error("Failed to fetch notification settings:", err);
                toast({
                    title: "Error",
                    description: "Failed to load notification settings. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);

    const handleToggle = async (key: keyof Settings, value: boolean) => {
        if (!settings) return;

        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);

        try {
            setSaving(true);
            await NotificationService.updateSettings({ [key]: value });
        } catch (err) {
            console.error("Failed to update setting:", err);
            // Rollback on error
            setSettings(settings);
            toast({
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePreference = async (key: keyof Settings, value: string) => {
        if (!settings) return;

        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);

        try {
            setSaving(true);
            await NotificationService.updateSettings({ [key]: value });
        } catch (err) {
            console.error("Failed to update preference:", err);
            setSettings(settings);
            toast({
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="w-full mx-auto p-8 space-y-4">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
                        <Bell className="h-7 w-7 text-teal-500" /> Notification Settings</h1>
                    <p className="text-muted-foreground">
                        Control how you receive notifications.
                    </p>
                </div>
            </div>

            {/* Channels Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        Notification Channels
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to receive notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 p-0">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Bell className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">In-App Notifications</Label>
                                <p className="text-sm text-slate-500">Receive notifications within the application.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.in_app_notifications_enabled}
                            onCheckedChange={(checked) => handleToggle("in_app_notifications_enabled", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">Push Notifications</Label>
                                <p className="text-sm text-slate-500">Get instant alerts on your desktop or mobile device.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.push_notifications_enabled}
                            onCheckedChange={(checked) => handleToggle("push_notifications_enabled", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-sm text-slate-500">Receive summaries and important alerts via email.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.sms_notifications_enabled} // Reusing field if email field is missing or mapped
                            onCheckedChange={(checked) => handleToggle("sms_notifications_enabled", checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Categories Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Notification Categories
                    </CardTitle>
                    <CardDescription>
                        Fine-tune which activities trigger notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* Project Activity */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-400" />
                                Project Activity
                            </h3>
                            <Switch
                                checked={settings.project_activity_enabled}
                                onCheckedChange={(checked) => handleToggle("project_activity_enabled", checked)}
                            />
                        </div>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 transition-opacity ${!settings.project_activity_enabled ? "opacity-40 pointer-events-none" : ""}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                                <Label className="text-sm">Comments & Mentions</Label>
                                <Switch

                                    checked={settings.project_activity_comments}
                                    onCheckedChange={(checked) => handleToggle("project_activity_comments", checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                                <Label className="text-sm">Document Changes</Label>
                                <Switch

                                    checked={settings.project_activity_changes}
                                    onCheckedChange={(checked) => handleToggle("project_activity_changes", checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collaboration */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                Collaboration
                            </h3>
                            <Switch
                                checked={settings.collaboration_enabled}
                                onCheckedChange={(checked) => handleToggle("collaboration_enabled", checked)}
                            />
                        </div>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 transition-opacity ${!settings.collaboration_enabled ? "opacity-40 pointer-events-none" : ""}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                                <Label className="text-sm">New Collaborators</Label>
                                <Switch

                                    checked={settings.collaboration_new_collaborator}
                                    onCheckedChange={(checked) => handleToggle("collaboration_new_collaborator", checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                                <Label className="text-sm">Permission Updates</Label>
                                <Switch

                                    checked={settings.collaboration_permission_changes}
                                    onCheckedChange={(checked) => handleToggle("collaboration_permission_changes", checked)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Preferences */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Delivery Preferences
                    </CardTitle>
                    <CardDescription>
                        Control when and how often you get notified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Notification Frequency</Label>
                            <Select
                                value={settings.frequency}
                                onValueChange={(val) => handleUpdatePreference("frequency", val)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="realtime">Real-time</SelectItem>
                                    <SelectItem value="hourly">Hourly Summary</SelectItem>
                                    <SelectItem value="daily">Daily Digest</SelectItem>
                                    <SelectItem value="weekly">Weekly Overview</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-blue-50 bg-blue-50/20">
                            <div className="space-y-1">
                                <Label className="text-blue-900">Quiet Hours</Label>
                                <p className="text-xs text-blue-700">Silence notifications during specific times.</p>
                            </div>
                            <Switch
                                checked={settings.quiet_hours_enabled}
                                onCheckedChange={(checked) => handleToggle("quiet_hours_enabled", checked)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>
                    </div>

                    {settings.quiet_hours_enabled && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Start Time</Label>
                                <Input
                                    type="time"
                                    value={settings.quiet_hours_start_time}
                                    onChange={(e) => handleUpdatePreference("quiet_hours_start_time", e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">End Time</Label>
                                <Input
                                    type="time"
                                    value={settings.quiet_hours_end_time}
                                    onChange={(e) => handleUpdatePreference("quiet_hours_end_time", e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationSettings;
