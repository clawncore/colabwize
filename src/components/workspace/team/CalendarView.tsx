"use client";

import { useState } from "react";
import { WorkspaceTask } from "../../../services/workspaceTaskService";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

interface CalendarViewProps {
  tasks: WorkspaceTask[];
  onTaskClick: (task: WorkspaceTask) => void;
  selectedTaskIds: string[];
  onToggleSelection: (id: string, selected: boolean) => void;
}

export function CalendarView({
  tasks,
  onTaskClick,
  selectedTaskIds,
  onToggleSelection,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("week");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);

  // Calculate grid days based on view mode
  const startDate =
    viewMode === "month" ? startOfWeek(monthStart) : startOfWeek(currentDate);
  const endDate =
    viewMode === "month" ? endOfWeek(monthEnd) : endOfWeek(currentDate);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextPeriod = () => {
    setCurrentDate(
      viewMode === "month"
        ? addMonths(currentDate, 1)
        : addWeeks(currentDate, 1),
    );
  };
  const prevPeriod = () => {
    setCurrentDate(
      viewMode === "month"
        ? subMonths(currentDate, 1)
        : subWeeks(currentDate, 1),
    );
  };
  const goToToday = () => setCurrentDate(new Date());

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px] lg:min-h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 font-outfit">
          {viewMode === "month"
            ? format(currentDate, "MMMM yyyy")
            : `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === "month"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === "week"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              Week
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 text-xs font-bold border-slate-200 bg-slate-300">
              Today
            </Button>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPeriod}
                className="h-8 w-8 p-0 rounded-none border-r border-slate-100">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPeriod}
                className="h-8 w-8 p-0 rounded-none">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 min-h-[300px] lg:min-h-[450px]">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isPadding = !isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] lg:min-h-[120px] p-1 border-r border-b border-slate-50 relative group transition-colors flex flex-col ${
                  isPadding && viewMode === "month"
                    ? "bg-slate-50/30"
                    : "bg-white"
                } ${idx % 7 === 6 ? "border-r-0" : ""}`}>
                <div className="flex justify-between items-center mb-1 px-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isTodayDate ? "bg-teal-600 text-white" : "text-slate-400"
                    }`}>
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-500 h-4 px-1.5 text-[10px] font-bold border-0">
                      {dayTasks.length}{" "}
                      {dayTasks.length === 1 ? "task" : "tasks"}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                  {dayTasks
                    .slice(0, viewMode === "week" ? dayTasks.length : 3)
                    .map((task, index) => {
                      const isSelected = selectedTaskIds.includes(task.id);
                      // In week view, if it's the only task, let it fill the space.
                      // If there are multiple, give them a fixed comfortable height so they can stack and scroll.
                      const isStandaloneInWeek =
                        viewMode === "week" && dayTasks.length === 1;

                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={`overflow-hidden rounded-sm border transition-all cursor-pointer flex flex-col ${
                            isStandaloneInWeek ? "flex-1" : "shrink-0"
                          } ${
                            isSelected
                              ? "bg-teal-50 border-teal-400 shadow-md ring-1 ring-teal-400"
                              : "bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm"
                          }`}
                          title={task.title}>
                          {/* Top Image Preview */}
                          <div
                            className={`w-full bg-slate-100 relative group ${
                              isStandaloneInWeek
                                ? "flex-1 min-h-[60px]"
                                : "h-12 lg:h-20"
                            }`}>
                            {/* Selection Checkbox overlay */}
                            <div
                              className="absolute top-1 left-1 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelection(task.id, !isSelected);
                              }}>
                              <div
                                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shadow-sm transition-all ${
                                  isSelected
                                    ? "bg-teal-500 border-teal-500 text-white opacity-100"
                                    : "bg-white/80 backdrop-blur-sm border-slate-300 text-transparent hover:border-teal-400 opacity-0 group-hover:opacity-100"
                                }`}>
                                <CheckSquare className="w-3 h-3" />
                              </div>
                            </div>
                            <img
                              src="https://www.sweetprocess.com/wp-content/uploads/2022/10/task-management-30-1.png"
                              alt="Task cover"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>

                          {/* Card Content */}
                          <div className="p-2 flex flex-col gap-1.5 shrink-0">
                            {/* Task Description/Title */}
                            <span
                              className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
                                isSelected ? "text-teal-900" : "text-slate-700"
                              }`}>
                              {task.title}
                            </span>

                            {/* Meta: Status and Priority */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge
                                variant="secondary"
                                className={`text-[9px] px-1.5 py-0 h-4 font-medium border-0 truncate max-w-[70px] ${
                                  task.status.toLowerCase() === "done"
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : task.status
                                          .toLowerCase()
                                          .includes("progress")
                                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}>
                                {task.status.replace(/_/g, " ")}
                              </Badge>

                              <Badge
                                variant="secondary"
                                className={`text-[9px] px-1.5 py-0 h-4 font-medium border-0 truncate uppercase max-w-[50px] ${
                                  task.priority === "high"
                                    ? "bg-red-50 text-red-600"
                                    : task.priority === "medium"
                                      ? "bg-orange-50 text-orange-600"
                                      : "bg-blue-50 text-blue-600"
                                }`}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {viewMode === "month" && dayTasks.length > 3 && (
                    <div className="text-[10px] font-bold text-slate-400 pl-1 shrink-0">
                      + {dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
