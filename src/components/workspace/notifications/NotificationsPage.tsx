"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  Check,
  Search,
  Filter,
  Trash2,
  Clock as Snooze,
  Archive,
  MessageSquare,
  FileText,
  Users,
  Zap,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  MoreHorizontal,
} from "lucide-react";
import NotificationService, {
  Notification,
} from "../../../services/notificationService";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: workspaceId } = useParams<{ id?: string }>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Filters and Search
  const [filter, setFilter] = useState<
    "all" | "unread" | "high" | "medium" | "low"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const PAGE_SIZE = 20;

  const fetchNotifications = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) setIsFetchingMore(true);
      else setLoading(true);

      try {
        const filters: any = {};
        if (filter === "unread") filters.read = false;
        else if (filter !== "all") filters.priority = filter;

        if (searchQuery) filters.search = searchQuery;

        const currentOffset = isLoadMore ? notifications.length : 0;
        const result = await NotificationService.getNotifications(
          PAGE_SIZE,
          currentOffset,
          filters,
        );

        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...result.notifications]);
        } else {
          setNotifications(result.notifications);
        }

        setUnreadCount(result.unreadCount);
        setHasMore(result.notifications.length === PAGE_SIZE);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications",
        );
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [filter, searchQuery, notifications.length],
  );

  useEffect(() => {
    fetchNotifications(false);
  }, [filter, searchQuery]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      fetchNotifications(true);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await NotificationService.dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // If it was unread, update count
      const dismissed = notifications.find((n) => n.id === id);
      if (dismissed && !dismissed.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to dismiss:", err);
    }
  };

  const handleSnooze = async (id: string, hours: number = 24) => {
    try {
      await NotificationService.snoozeNotification(id, hours);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to snooze:", err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.data) {
      const { workspaceId, taskId, documentId } = notification.data || {};
      if (workspaceId) {
        if (taskId) {
          navigate(
            `/dashboard/workspace/${workspaceId}/kanban?taskId=${taskId}`,
          );
        } else if (documentId) {
          navigate(`/dashboard/editor/${documentId}`);
        } else {
          navigate(`/dashboard/workspace/${workspaceId}/overview`);
        }
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "mention":
      case "comment_added":
      case "comment_resolved":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "document_change":
      case "document_shared":
      case "document_version":
      case "document_deadline":
      case "document_exported":
        return <FileText className="h-5 w-5 text-emerald-500" />;
      case "new_collaborator":
      case "permission_change":
      case "collaborator_request":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "ai_suggestion":
      case "ai_limit":
        return <Zap className="h-5 w-5 text-amber-500" />;
      case "payment_success":
      case "payment_failed":
      case "subscription_renewed":
        return <CreditCard className="h-5 w-5 text-indigo-500" />;
      case "security_alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "writing_streak":
      case "goal_achieved":
        return <CheckCircle className="h-5 w-5 text-pink-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-3 bg-blue-500 text-white border-0">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 mt-1">
            Stay updated with your workspace activity and alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-slate-600 border-slate-200">
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsSearchVisible(!isSearchVisible)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (workspaceId) {
                navigate(
                  `/dashboard/admin/${workspaceId}/notifications?tab=notifications`,
                );
              } else {
                navigate(`/dashboard/settings/notifications`);
              }
            }}
            className="text-slate-600 border-slate-200">
            Settings
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(["all", "unread", "high", "medium", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                filter === f
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div
          className={`relative flex-1 min-w-[240px] ${isSearchVisible ? "block" : "hidden sm:block"}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              Error Loading Notifications
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">{error}</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => fetchNotifications(false)}>
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-300 rounded-full mb-4 font-sans">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              No Notifications
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              We'll notify you when something important happens in your
              workspaces.
            </p>
            {filter !== "all" || searchQuery ? (
              <Button
                variant="ghost"
                className="mt-4 text-blue-600"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}>
                Clear all filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start p-4 gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}>
                <div
                  className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.read
                      ? "bg-white shadow-sm ring-1 ring-slate-100"
                      : "bg-slate-50"
                  }`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        !notification.read
                          ? "text-slate-900"
                          : "text-slate-700 font-medium"
                      }`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                      {new Date(notification.created_at).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed line-clamp-2 ${
                      !notification.read ? "text-slate-600" : "text-slate-500"
                    }`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center mt-2.5 space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter">
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSnooze(notification.id);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-tighter">
                      Snooze
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-red-600 uppercase tracking-tighter">
                      Dismiss
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-200">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem
                        onClick={() => handleSnooze(notification.id, 1)}>
                        <Snooze className="h-4 w-4 mr-2" /> Snooze 1h
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSnooze(notification.id, 24)}>
                        <Snooze className="h-4 w-4 mr-2" /> Snooze 24h
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDismiss(notification.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            className="text-blue-600 font-medium hover:bg-blue-50"
            onClick={handleLoadMore}
            disabled={isFetchingMore}>
            {isFetchingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
