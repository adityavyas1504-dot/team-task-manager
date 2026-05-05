const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

exports.requireProjectRole = (roles) => async (req, res, next) => {
  const Project = require('../models/Project');
  try {
    const project = await Project.findById(req.params.projectId || req.body.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    if (roles && !roles.includes(member.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (err) {
    next(err);
  }
};
