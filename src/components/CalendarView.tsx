"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Task, Category } from "@/types";
import { getCategoryColor, getCategoryIcon } from "@/lib/utils";
import TaskEditor from "@/components/forms/TaskEditor";

interface CalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: Category[];
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function CalendarView({ 
  isOpen, 
  onClose, 
  tasks, 
  categories, 
  onUpdateTask, 
  onDeleteTask 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);

  // Get current month's calendar data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    }).sort((a, b) => {
      // Sort by importance (high to low), then by time
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }
      return a.time.localeCompare(b.time);
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle task completion toggle
  const toggleTaskCompletion = (task: Task) => {
    const updatedTask = new Task(task.name, task.date, task.time, task.importance, task.category, task.color, task.notes);
    updatedTask.id = task.id;
    updatedTask.completed = !task.completed;
    updatedTask.createdAt = task.createdAt;
    updatedTask.updatedAt = new Date();
    onUpdateTask(updatedTask);
  };

  // Handle task editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskEditorOpen(true);
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(taskId);
    }
  };

  // Get importance badge
  const getImportanceBadge = (importance: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      3: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    
    const labels = {
      1: 'Low',
      2: 'Medium', 
      3: 'High'
    };

    return (
      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[importance as keyof typeof colors]}`}>
        {labels[importance as keyof typeof labels]}
      </span>
    );
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  const calendarDays = getCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Calendar View
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-white dark:bg-gray-800 p-3 text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const isTodayDate = isToday(date);
              const isCurrentMonthDate = isCurrentMonth(date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] bg-white dark:bg-gray-800 p-2 ${
                    !isCurrentMonthDate ? 'opacity-50' : ''
                  } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-2 ${
                    isTodayDate 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isCurrentMonthDate 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* Tasks for this day */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 rounded text-xs cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          task.completed 
                            ? 'opacity-60 line-through bg-gray-100 dark:bg-gray-700' 
                            : ''
                        }`}
                        style={{
                          borderLeft: `3px solid ${getCategoryColor(task.category, categories)}`
                        }}
                        onClick={() => handleEditTask(task)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {getCategoryIcon(task.category, categories)}
                            </span>
                            {getImportanceBadge(task.importance)}
                          </div>
                        </div>
                        <div className="font-medium truncate">
                          {task.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {task.time}
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-600 dark:text-gray-300">Low Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-gray-600 dark:text-gray-300">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-600 dark:text-gray-300">High Priority</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {tasks.length} total tasks
            </div>
          </div>
        </div>
      </div>

      {/* Task Editor Modal */}
      <TaskEditor
        isOpen={isTaskEditorOpen}
        onClose={() => {
          setIsTaskEditorOpen(false);
          setEditingTask(null);
        }}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        task={editingTask}
        categories={categories}
      />
    </div>
  );
} 