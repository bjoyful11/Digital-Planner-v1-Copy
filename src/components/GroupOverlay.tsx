import React, { useState, useEffect } from 'react';
import { Task, Category } from '@/types';
import TaskForm from './forms/TaskForm';
import TaskEditor from './forms/TaskEditor';
import CategoryManager from './forms/CategoryManager';
import CalendarView from './CalendarView';
import { Calendar, Plus, Settings, Clock, Edit2, Trash2, Check, User } from 'lucide-react';

interface GroupOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupOverlay: React.FC<GroupOverlayProps> = ({ isOpen, onClose }) => {
  // Group-specific state
  const [groupTasks, setGroupTasks] = useState<Task[]>([]);
  const [groupCategories, setGroupCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Placeholder: Load group data (replace with real fetch logic)
  useEffect(() => {
    if (isOpen) {
      // TODO: Fetch group tasks and categories from backend
      setGroupCategories([
        { id: 'group-school', name: 'School', color: '#3B82F6', icon: '📚' },
        { id: 'group-work', name: 'Work', color: '#10B981', icon: '💼' },
        { id: 'group-personal', name: 'Personal', color: '#F59E0B', icon: '👤' },
      ]);
      setGroupTasks([]); // TODO: Replace with real group tasks
    }
  }, [isOpen]);

  const sortedTasks = [...groupTasks].sort(Task.compareTasks);
  const filteredTasks = selectedCategory === 'all'
    ? sortedTasks
    : sortedTasks.filter(task => task.category === selectedCategory);

  const handleAddTask = (task: Task) => {
    setGroupTasks([...groupTasks, task]);
  };
  const handleUpdateTask = (updatedTask: Task) => {
    setGroupTasks(groupTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };
  const handleDeleteTask = (taskId: string) => {
    setGroupTasks(groupTasks.filter(task => task.id !== taskId));
  };
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskEditorOpen(true);
  };
  const handleCategoriesChange = (newCategories: Category[]) => {
    setGroupCategories(newCategories);
    if (selectedCategory !== 'all' && !newCategories.find(cat => cat.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  };
  const getCategoryColor = (categoryId: string, categories: Category[]) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#6B7280';
  };
  const getCategoryIcon = (categoryId: string, categories: Category[]) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : '📁';
  };
  const getCategoryName = (categoryId: string, categories: Category[]) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[importance as keyof typeof colors]}`}>
        {labels[importance as keyof typeof labels]}
      </span>
    );
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 m-4 flex flex-col min-h-[80vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Close group overlay"
        >
          <span className="text-xl">&times;</span>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Group Planner</h2>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
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
                  {groupTasks.length}
                </span>
              </button>
              {groupCategories.map((category) => (
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
                    {groupTasks.filter(task => task.category === category.id).length}
                  </span>
                </button>
              ))}
            </nav>
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
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedCategory === 'all' ? 'All Tasks' : getCategoryName(selectedCategory, groupCategories)}
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
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {groupTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Welcome to the Group Planner
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start organizing group tasks by category. Click "Add Task" to create your first group task.
                    </p>
                    <button
                      onClick={() => setIsTaskFormOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Group Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Tasks ({filteredTasks.length}) - Sorted by Importance
                    </h3>
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group ${
                          task.completed ? 'opacity-60 bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: getCategoryColor(task.category, groupCategories) }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-gray-900 dark:text-white ${
                              task.completed ? 'line-through' : ''
                            }`}>
                              {task.name}
                            </h4>
                            {getImportanceBadge(task.importance)}
                            {task.completed && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full text-xs font-medium">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{task.date.toString()}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {getCategoryIcon(task.category, groupCategories)}
                          </span>
                          <button
                            onClick={() => {
                              const updatedTask = new Task(task.name, task.date, task.time, task.importance, task.category, task.color, task.notes);
                              updatedTask.id = task.id;
                              updatedTask.completed = !task.completed;
                              updatedTask.createdAt = task.createdAt;
                              updatedTask.updatedAt = new Date();
                              handleUpdateTask(updatedTask);
                            }}
                            className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                            title={task.completed ? "Mark incomplete" : "Mark complete"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
        {/* Modals for group planner */}
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onAddTask={handleAddTask}
          categories={groupCategories}
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
          categories={groupCategories}
        />
        <CategoryManager
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          onCategoriesChange={handleCategoriesChange}
          categories={groupCategories}
          user={null} // No user for group planner yet
        />
        <CalendarView
          isOpen={isCalendarViewOpen}
          onClose={() => setIsCalendarViewOpen(false)}
          tasks={groupTasks}
          categories={groupCategories}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default GroupOverlay; 