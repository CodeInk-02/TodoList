import { useEffect, useState, useCallback, useMemo } from "react";
import { MdDelete, MdEdit, MdAdd, MdCheck, MdClose } from "react-icons/md";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDebounce } from "./hooks/useDebounce";
import "./App.css";

// Task status constants
const TASK_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
};

// Filter options
const FILTER_OPTIONS = {
  ALL: "all",
  PENDING: "pending",
  COMPLETED: "completed",
};

const App = () => {
  // State management with local storage
  const [tasks, setTasks] = useLocalStorage("todo-tasks", []);
  const [filter, setFilter] = useState(FILTER_OPTIONS.ALL);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Filtered and searched tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    if (filter !== FILTER_OPTIONS.ALL) {
      filtered = filtered.filter(task => task.status === filter);
    }

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, filter, debouncedSearchTerm]);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validate form data
  const validateForm = useCallback((data) => {
    if (!data.title.trim()) {
      alert("Please enter a task title");
      return false;
    }
    if (!data.description.trim()) {
      alert("Please enter a task description");
      return false;
    }
    return true;
  }, []);

  // Add new task
  const handleAddTask = useCallback(async () => {
    if (!validateForm(formData)) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newTask = {
      id: generateId(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: TASK_STATUS.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);
    setFormData({ title: "", description: "" });
    setIsLoading(false);
  }, [formData, validateForm, generateId, setTasks]);

  // Update existing task
  const handleUpdateTask = useCallback(async () => {
    if (!editingTask || !validateForm(formData)) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const updatedTask = {
      ...editingTask,
      title: formData.title.trim(),
      description: formData.description.trim(),
      updatedAt: Date.now(),
    };

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id ? updatedTask : task
    ));
    
    setEditingTask(null);
    setFormData({ title: "", description: "" });
    setIsLoading(false);
  }, [editingTask, formData, validateForm, setTasks]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));

    setTasks(prev => prev.filter(task => task.id !== taskId));
    setIsLoading(false);
  }, [setTasks]);

  // Toggle task status
  const handleToggleStatus = useCallback(async (taskId) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === TASK_STATUS.COMPLETED 
              ? TASK_STATUS.PENDING 
              : TASK_STATUS.COMPLETED,
            updatedAt: Date.now()
          }
        : task
    ));
    setIsLoading(false);
  }, [setTasks]);

  // Start editing task
  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description });
  }, []);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
    setFormData({ title: "", description: "" });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (editingTask) {
      handleUpdateTask();
    } else {
      handleAddTask();
    }
  }, [editingTask, handleUpdateTask, handleAddTask]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setEditingTask(null);
            setFormData({ title: "", description: "" });
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">📝</span>
          TodoList
        </h1>
        <p className="app-subtitle">Organize your tasks efficiently</p>
      </header>

      <main className="app-main">
        {/* Task Statistics */}
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-number">{taskStats.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{taskStats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{taskStats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{taskStats.completionRate}%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input
            id="search-input"
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search tasks"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="search-clear"
              aria-label="Clear search"
            >
              <MdClose />
            </button>
          )}
        </div>

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-header">
            <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
            {editingTask && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cancel-btn"
                aria-label="Cancel editing"
              >
                <MdClose />
              </button>
            )}
          </div>
          
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="title-input" className="form-label">
                Title *
              </label>
              <input
                id="title-input"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter task title"
                className="form-input"
                required
                disabled={isLoading}
                aria-describedby="title-help"
              />
              <small id="title-help" className="form-help">
                Brief description of the task
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="description-input" className="form-label">
                Description *
              </label>
              <textarea
                id="description-input"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter task description"
                className="form-textarea"
                rows={3}
                required
                disabled={isLoading}
                aria-describedby="description-help"
              />
              <small id="description-help" className="form-help">
                Detailed description of what needs to be done
              </small>
            </div>
          </div>

          <button
            type="submit"
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || (!formData.title.trim() && !formData.description.trim())}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : editingTask ? (
              <>
                <MdEdit />
                Update Task
              </>
            ) : (
              <>
                <MdAdd />
                Add Task
              </>
            )}
          </button>
        </form>

        {/* Filter Buttons */}
        <div className="filter-container">
          {Object.entries(FILTER_OPTIONS).map(([key, value]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`filter-btn ${filter === value ? 'active' : ''}`}
              aria-pressed={filter === value}
            >
              {key.charAt(0) + key.slice(1).toLowerCase()}
              {key !== 'ALL' && (
                <span className="filter-count">
                  {key === 'PENDING' ? taskStats.pending : taskStats.completed}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="task-list-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tasks found</h3>
              <p>
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : filter !== FILTER_OPTIONS.ALL
                  ? `No ${filter} tasks yet`
                  : "Create your first task to get started!"
                }
              </p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.status === TASK_STATUS.COMPLETED ? 'completed' : ''}`}
                >
                  <div className="task-content">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <span className="task-date">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    {task.updatedAt !== task.createdAt && (
                      <small className="task-updated">
                        Updated: {new Date(task.updatedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>

                  <div className="task-actions">
                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`status-btn ${task.status === TASK_STATUS.COMPLETED ? 'completed' : ''}`}
                      disabled={isLoading}
                      aria-label={`Mark task as ${task.status === TASK_STATUS.COMPLETED ? 'pending' : 'completed'}`}
                    >
                      <MdCheck />
                    </button>
                    
                    <button
                      onClick={() => handleEditTask(task)}
                      className="action-btn edit-btn"
                      disabled={isLoading}
                      aria-label="Edit task"
                    >
                      <MdEdit />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="action-btn delete-btn"
                      disabled={isLoading}
                      aria-label="Delete task"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Keyboard Shortcuts Help */}
      <footer className="app-footer">
        <p className="shortcuts-help">
          <strong>Keyboard shortcuts:</strong> Ctrl+N (New task), Ctrl+F (Search)
        </p>
      </footer>
    </div>
  );
};

export default App;
