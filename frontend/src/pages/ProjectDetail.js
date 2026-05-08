import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateProject, deleteProject, getTasks, createTask, updateTask, deleteTask, addMember, removeMember, updateMemberRole } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['Todo', 'In Progress', 'Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const statusBadge = (s) => ({ 'Todo': 'badge-todo', 'In Progress': 'badge-inprogress', 'Review': 'badge-review', 'Done': 'badge-done' }[s] || 'badge-todo');
const priorityBadge = (p) => ({ 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high', 'Critical': 'badge-critical' }[p] || 'badge-medium');

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'Todo', priority: 'Medium', assignedTo: '', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  const myRole = project?.members?.find(m => m.user._id === user?._id)?.role;
  const isAdmin = myRole === 'Admin';

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([getProject(id), getTasks(id)]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const openCreateTask = (status = 'Todo') => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status, priority: 'Medium', assignedTo: '', dueDate: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowTaskModal(true);
  };

  const handleTaskSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTask) {
        const res = await updateTask(editingTask._id, taskForm);
        setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data.data : t));
        toast.success('Task updated');
      } else {
        const res = await createTask({ ...taskForm, projectId: id });
        setTasks(prev => [res.data.data, ...prev]);
        toast.success('Task created');
      }
      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await addMember(id, { email: memberEmail, role: memberRole });
      setProject(res.data.data);
      setMemberEmail('');
      setShowMemberModal(false);
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await removeMember(id, memberId);
      setProject(res.data.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
          <div>
            <h1 className="page-title">{project.name}</h1>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Add Member
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => openCreateTask()}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Task
          </button>
          {isAdmin && project.owner === user?._id && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['board', 'list', 'members'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'members' && <span style={{ marginLeft: 6, fontSize: 11 }}>({project.members?.length})</span>}
          </button>
        ))}
      </div>

      {/* Filters (for board/list) */}
      {activeTab !== 'members' && (
        <div className="filters-bar">
          <div className="search-input">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input className="form-control" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <span style={{ fontSize: 13, color: 'var(--gray-500)', marginLeft: 'auto' }}>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Board View */}
      {activeTab === 'board' && (
        <div className="kanban-board">
          {STATUSES.map(status => {
            const statusTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="kanban-col-title">{status}</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span className="kanban-count">{statusTasks.length}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openCreateTask(status)} title="Add task">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
                {statusTasks.map(task => (
                  <div key={task._id} className="kanban-task" onClick={() => openEditTask(task)}>
                    <div className="kanban-task-title">{task.title}</div>
                    <div className="kanban-task-footer">
                      <span className={`badge ${priorityBadge(task.priority)}`}>{task.priority}</span>
                      {task.assignedTo && (
                        <div className="avatar sm" style={{ background: project.color }} title={task.assignedTo.name}>
                          {task.assignedTo.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    {task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done' && (
                      <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>
                        Overdue: {format(new Date(task.dueDate), 'MMM d')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="card">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
              <h3>No tasks found</h3>
              <p>Add a task or adjust your filters</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task._id} className="task-item" style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--gray-100)' }}>
                <div className="task-content">
                  <div className={`task-title ${task.status === 'Done' ? 'done' : ''}`}>{task.title}</div>
                  <div className="task-meta">
                    <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
                    <span className={`badge ${priorityBadge(task.priority)}`}>{task.priority}</span>
                    {task.assignedTo && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{task.assignedTo.name}</span>}
                    {task.dueDate && (
                      <span className={`task-due ${isPast(new Date(task.dueDate)) && task.status !== 'Done' ? 'overdue' : ''}`}>
                        Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <select className="form-control" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                    value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)} onClick={e => e.stopPropagation()}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEditTask(task)}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  {(isAdmin || task.createdBy?._id === user?._id) && (
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTask(task._id)}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Members View */}
      {activeTab === 'members' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Team Members</span>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>Add Member</button>
            )}
          </div>
          <div className="card-body">
            <div className="members-list">
              {project.members?.map(m => (
                <div key={m._id} className="member-item">
                  <div className="avatar" style={{ background: project.color }}>
                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{m.user?.name} {m.user?._id === user?._id && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>(you)</span>}</div>
                    <div className="member-email">{m.user?.email}</div>
                  </div>
                  <span className={`badge badge-${m.role?.toLowerCase()}`}>{m.role}</span>
                  {isAdmin && m.user?._id !== project.owner && m.user?._id !== user?._id && (
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveMember(m.user._id)}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingTask ? 'Edit Task' : 'Create Task'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowTaskModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleTaskSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" placeholder="Task title" value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" placeholder="Optional description" value={taskForm.description}
                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={taskForm.status}
                      onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-control" value={taskForm.priority}
                      onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-control" value={taskForm.assignedTo}
                      onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                      <option value="">Unassigned</option>
                      {project.members?.map(m => (
                        <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-control" value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editingTask && (isAdmin || editingTask.createdBy?._id === user?._id) && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }}
                    onClick={() => { handleDeleteTask(editingTask._id); setShowTaskModal(false); }}>
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Team Member</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowMemberModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" placeholder="member@example.com"
                    value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                    <option>Member</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
