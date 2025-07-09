"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Settings, Sun, Moon, Clock, Edit2, Trash2, Check, User } from "lucide-react";
import { Task, Category } from "@/types";
import { loadCategories, getCategoryColor, getCategoryIcon, getCategoryName, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { loadUserTasks, saveTask, updateTask, deleteTask, loadUserCategories, saveCategory, updateCategory, deleteCategory } from "@/lib/auth";
import TaskForm from "@/components/forms/TaskForm";
import TaskEditor from "@/components/forms/TaskEditor";
import CategoryManager from "@/components/forms/CategoryManager";
import CalendarView from "@/components/CalendarView";
import LoginModal from "@/components/auth/LoginModal";
import UserMenu from "@/components/auth/UserMenu";

export default function GroupPlanner() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Placeholder: In the future, fetch groupId from route or context
  const groupId = "demo-group-id";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          setTasks([]);
          setCategories([]);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // TODO: In the future, load group-specific tasks/categories
          const userTasks = await loadUserTasks(user.id);
          setTasks(userTasks);
          const userCategories = await loadUserCategories(user.id);
          setCategories(userCategories);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        const loadedCategories = loadCategories();
        setCategories(loadedCategories);
        setTasks([]);
      }
    };
    loadUserData();
  }, [user]);

  const sortedTasks = [...tasks].sort(Task.compareTasks);
  const filteredTasks = selectedCategory === 'all' 
    ? sortedTasks 
    : sortedTasks.filter(task => task.category === selectedCategory);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddTask = async (task: Task) => {
    if (user) {
      try {
        await saveTask(task, user.id);
        setTasks([...tasks, task]);
      } catch (error) {
        console.error('Error saving task:', error);
      }
    } else {
      setTasks([...tasks, task]);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (user) {
      try {
        await updateTask(updatedTask, user.id);
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else {
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (user) {
      try {
        await deleteTask(taskId, user.id);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    } else {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskEditorOpen(true);
  };

  const handleCategoriesChange = async (newCategories: Category[]) => {
    setCategories(newCategories);
    if (selectedCategory !== 'all' && !newCategories.find(cat => cat.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  };

  const getImportanceBadge = (importance: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      3: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[importance as keyof typeof colors]}`}>
        {labels[importance as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Group Planner
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">(Group Mode)</p>
              <p className="text-xs text-blue-500 mt-2">[Future: Add group-specific features here]</p>
            </div>
            {/* Category Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">📋</span>
                <span className="font-medium">All Tasks</span>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  {tasks.length}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    {tasks.filter(task => task.category === category.id).length}
                  </span>
                </button>
              ))}
            </nav>
            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <button 
                onClick={() => setIsTaskFormOpen(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
              <button 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Categories
              </button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Tasks' : getCategoryName(selectedCategory, categories)}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} • Sorted by importance
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsCalendarViewOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Calendar View"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle dark mode"
                  title="Toggle light/dark mode"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                {user ? (
                  <UserMenu user={user} onLogout={() => setUser(null)} />
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Sign In"
                  >
                    <User className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </header>
          {/* Calendar/Tasks Area */}
          <main className="flex-1 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Welcome to Your Group Planner
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start organizing your group tasks by category. Click "Add Task" to create your first group task.
                  </p>
                  <button 
                    onClick={() => setIsTaskFormOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Group Task
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTasks.map((task) => (
                    <li key={task.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(task.category, categories) }} />
                        <span className="font-medium text-gray-900 dark:text-white">{task.name}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(task.date)} {task.time}</span>
                        {getImportanceBadge(task.importance)}
                        {task.completed && <Check className="w-4 h-4 text-green-500 ml-2" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Modals */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onAddTask={handleAddTask}
        categories={categories}
        defaultCategory={selectedCategory}
      />
      <TaskEditor
        isOpen={isTaskEditorOpen}
        onClose={() => {
          setIsTaskEditorOpen(false);
          setEditingTask(null);
        }}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        task={editingTask}
        categories={categories}
      />
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoriesChange={handleCategoriesChange}
        categories={categories}
        user={user}
      />
      <CalendarView
        isOpen={isCalendarViewOpen}
        onClose={() => setIsCalendarViewOpen(false)}
        tasks={tasks}
        categories={categories}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={setUser}
      />
    </div>
  );
} 