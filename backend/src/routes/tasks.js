const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTasks, getMyTasks, getDashboardStats,
  createTask, updateTask, deleteTask
} = require('../controllers/taskController');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/my-tasks', getMyTasks);
router.get('/project/:projectId', getTasks);

router.route('/')
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
