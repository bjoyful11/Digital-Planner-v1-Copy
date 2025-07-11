// Digital Planner Type Definitions

export class Task {
  id: string;
  name: string;
  date: Date;
  time: string;
  importance: number; // 1-3 (1 = low, 2 = medium, 3 = high)
  category: string; // Now using string instead of fixed Category type
  color: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes?: string; // Optional notes field

  constructor(
    name: string,
    date: Date,
    time: string,
    importance: number,
    category: string,
    color: string,
    notes?: string // Optional notes param
  ) {
    this.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.date = date;
    this.time = time;
    this.importance = Math.max(1, Math.min(3, importance)); // Ensure range 1-3
    this.category = category;
    this.color = color;
    this.completed = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.notes = notes;
  }

  // Method to get importance level as string
  getImportanceLevel(): string {
    switch (this.importance) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      default: return 'medium';
    }
  }

  // Method to get importance color
  getImportanceColor(): string {
    switch (this.importance) {
      case 1: return '#10B981'; // green
      case 2: return '#F59E0B'; // yellow
      case 3: return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  }

  // Method to compare tasks for sorting (higher importance first, then by date/time)
  static compareTasks(a: Task, b: Task): number {
    // First sort by importance (higher first)
    if (a.importance !== b.importance) {
      return b.importance - a.importance;
    }
    
    // Then sort by date
    const dateComparison = a.date.getTime() - b.date.getTime();
    if (dateComparison !== 0) {
      return dateComparison;
    }
    
    // Finally sort by time
    return a.time.localeCompare(b.time);
  }
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean; // To identify built-in categories
  isCollaborative?: boolean; // If true, category is open to collaboration
  sharedWith?: string[]; // Array of user emails or IDs for collaboration
}

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  currentDate: Date;
}

export interface TaskFormData {
  name: string;
  date: string;
  time: string;
  importance: number;
  category: string;
}

export interface FilterOptions {
  category?: string | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  importance?: number | 'all';
  completed?: boolean | 'all';
}

export interface SummaryStats {
  total: number;
  completed: number;
  pending: number;
  byCategory: Record<string, number>;
  byImportance: Record<number, number>;
} 