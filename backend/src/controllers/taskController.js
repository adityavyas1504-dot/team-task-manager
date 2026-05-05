const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check project membership
const checkMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  const member = project.members.find(m => m.user.toString() === userId.toString());
  if (!member) return { error: 'Not a member of this project', status: 403 };
  return { project, member };
};

// @desc    Get tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo, search } = req.query;

    const { error, status: errStatus } = await checkMembership(projectId, req.user._id);
    if (error) return res.status(errStatus).json({ success: false, message: error });

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all tasks assigned to current user across projects
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name color')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all projects for user
    const projects = await Project.find({ 'members.user': req.user._id }).select('_id name color');
    const projectIds = projects.map(p => p._id);

    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const myTasks = await Task.countDocuments({ project: { $in: projectIds }, assignedTo: req.user._id });
    const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, status: 'Done' });
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' }
    });

    // Recent tasks
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .sort('-createdAt')
      .limit(5);

    // Tasks by status
    const statusBreakdown = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks,
        myTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
        statusBreakdown,
        projects
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create task
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.body;
    const { error, status, member } = await checkMembership(projectId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const task = await Task.create({
      ...req.body,
      project: projectId,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { error, status, member } = await checkMembership(task.project._id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Members can only update status; admins can update everything
    const allowedFields = req.body;
    if (member.role === 'Member') {
      // Members can update status if task is assigned to them or they created it
      if (task.assignedTo?.toString() !== req.user._id.toString() &&
          task.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, allowedFields, {
      new: true, runValidators: true
    }).populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { error, status, member } = await checkMembership(task.project, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (member.role !== 'Admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
