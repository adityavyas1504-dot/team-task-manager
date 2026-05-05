import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject } from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', dueDate: '', color: COLORS[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    getProjects()
      .then(res => setProjects(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createProject(form);
      setProjects(prev => [res.data.data, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '', dueDate: '', color: COLORS[0] });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          <h3>No projects yet</h3>
          <p>Create your first project to start assigning tasks</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const pct = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
            return (
              <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
                <div className="project-card-bar" style={{ background: project.color }} />
                <div className="project-card-body">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="project-card-name">{project.name}</div>
                    <span className={`badge badge-${project.status?.toLowerCase().replace(' ', '')}`} style={{ fontSize: 10, marginLeft: 8, flexShrink: 0 }}>
                      {project.status}
                    </span>
                  </div>
                  <div className="project-card-desc">{project.description || 'No description'}</div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="progress-text">{project.completedCount}/{project.taskCount} tasks</span>
                      <span className="progress-text">{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: project.color }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                      {project.members?.slice(0, 4).map((m, i) => (
                        <div key={m._id} className="avatar sm" style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid white', background: project.color, zIndex: 4 - i }}>
                          {m.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      ))}
                      {project.members?.length > 4 && (
                        <div className="avatar sm" style={{ marginLeft: -8, border: '2px solid white', background: '#9ca3af', fontSize: 9 }}>
                          +{project.members.length - 4}
                        </div>
                      )}
                    </div>
                    {project.overdueCount > 0 && (
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>
                        {project.overdueCount} overdue
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Project</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input className="form-control" placeholder="e.g. Website Redesign" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" placeholder="What is this project about?" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-control" value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-picker">
                    {COLORS.map(c => (
                      <div key={c} className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                        style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
