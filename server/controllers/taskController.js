import Task from '../models/Task.js';

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sort } = req.query;

    let query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    } else if (sort === 'priority') {
      sortOption = { priority: -1 };
    }

    const tasks = await Task.find(query).sort(sortOption);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task statistics for logged in user
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Task.countDocuments({ user: userId });
    const todo = await Task.countDocuments({ user: userId, status: 'todo' });
    const inProgress = await Task.countDocuments({ user: userId, status: 'in_progress' });
    const completed = await Task.countDocuments({ user: userId, status: 'completed' });
    const highPriority = await Task.countDocuments({ user: userId, priority: 'high' });

    res.json({
      total,
      todo,
      inProgress,
      completed,
      highPriority,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Check task ownership
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé à cette tâche' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Le titre de la tâche est obligatoire' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé à modifier cette tâche' });
    }

    const { title, description, status, priority, dueDate } = req.body;

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé à supprimer cette tâche' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Tâche supprimée avec succès', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
