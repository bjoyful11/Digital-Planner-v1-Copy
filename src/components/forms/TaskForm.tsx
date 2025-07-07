"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { Task, Category } from "@/types";
import { createDateFromString } from "@/lib/utils";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  categories: Category[];
  defaultCategory?: string | 'all';
}

export default function TaskForm({ isOpen, onClose, onAddTask, categories, defaultCategory }: TaskFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    importance: "2",
    category: categories.length > 0 ? categories[0].id : "",
    notes: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default date, time, and category when form opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setFormData(f => ({
        ...f,
        date: dateStr,
        time: timeStr,
        category:
          defaultCategory && defaultCategory !== 'all'
            ? defaultCategory
            : categories.length > 0
              ? categories[0].id
              : ""
      }));
    }
  }, [isOpen, defaultCategory, categories]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Task name must be at least 3 characters";
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      // Use user's local time for both selected and current
      const now = new Date();
      const [inputHour, inputMinute] = formData.time.split(":").map(Number);
      const selectedDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
      );
      const formDateParts = formData.date.split("-").map(Number);
      const selectedDate = new Date(formDateParts[0], formDateParts[1] - 1, formDateParts[2], 0, 0, 0, 0);
      if (selectedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)) {
        newErrors.date = "Date cannot be in the past";
      } else if (selectedDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()) {
        // If today, check time
        if (
          inputHour < now.getHours() ||
          (inputHour === now.getHours() && inputMinute <= now.getMinutes())
        ) {
          newErrors.time = "Time must be in the future";
        }
      }
    }

    // Validate time
    if (!formData.time) {
      newErrors.time = "Time is required";
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.time)) {
        newErrors.time = "Please enter a valid time (HH:MM)";
      }
    }

    // Validate importance
    const importance = parseInt(formData.importance);
    if (isNaN(importance) || importance < 1 || importance > 3) {
      newErrors.importance = "Importance must be between 1 and 3";
    }

    // Validate category
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (!selectedCategory) {
        setErrors({ category: "Please select a valid category" });
        return;
      }

      const task = new Task(
        formData.name.trim(),
        createDateFromString(formData.date),
        formData.time,
        parseInt(formData.importance),
        formData.category,
        selectedCategory.color,
        formData.notes?.trim() || undefined
      );
      
      onAddTask(task);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      date: "",
      time: "",
      importance: "2",
      category: categories.length > 0 ? categories[0].id : "",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Task
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Name <span className="text-red-500 text-xs align-super">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              }`}
              placeholder="Enter task name"
            />
            {errors.name && (
              <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date <span className="text-red-500 text-xs align-super">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              {errors.date && (
                <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.date}
                </div>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time <span className="text-red-500 text-xs align-super">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.time 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                />
                <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              {errors.time && (
                <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.time}
                </div>
              )}
            </div>
          </div>

          {/* Importance */}
          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Importance <span className="text-red-500 text-xs align-super">*</span>
            </label>
            <select
              id="importance"
              value={formData.importance}
              onChange={(e) => handleInputChange("importance", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.importance 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              }`}
            >
              <option value="1">Low (1)</option>
              <option value="2">Medium (2)</option>
              <option value="3">High (3)</option>
            </select>
            {errors.importance && (
              <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.importance}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-500 text-xs align-super">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category}
              </div>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes <span className="text-gray-400 text-xs align-super">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Add any notes for this task (optional)"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 