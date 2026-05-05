const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, updateMemberRole
} = require('../controllers/projectController');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId', updateMemberRole);

module.exports = router;
