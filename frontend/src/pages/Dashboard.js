import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../utils/api';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const map = { 'Todo': 'badge-todo', 'In Progress': 'badge-inprogress', 'Review': 'badge-review', 'Done': 'badge-done' };
  return <span className={`badge ${map[status] || 'badge-todo'}`}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high', 'Critical': 'badge-critical' };
  return <span className={`badge ${map[priority] || 'badge-medium'}`}>{priority}</span>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Project
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </div>
          <div className="stat-label">Total Projects</div>
          <div className="stat-value">{stats?.totalProjects || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
          </div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats?.totalTasks || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats?.completedTasks || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: stats?.overdueTasks > 0 ? '#ef4444' : undefined }}>{stats?.overdueTasks || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div className="stat-label">Assigned to Me</div>
          <div className="stat-value">{stats?.myTasks || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon indigo">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{completionRate}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Tasks</span>
            <Link to="/my-tasks" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats?.recentTasks?.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No tasks yet</p>
              </div>
            ) : (
              <div>
                {stats?.recentTasks?.map(task => (
                  <div key={task._id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--gray-100)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 4 }} className="truncate">
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.project && (
                          <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                            {task.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: isPast(new Date(task.dueDate)) && task.status !== 'Done' ? 'var(--danger)' : 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tasks by Status</span>
          </div>
          <div className="card-body">
            {['Todo', 'In Progress', 'Review', 'Done'].map(status => {
              const count = stats?.statusBreakdown?.find(s => s._id === status)?.count || 0;
              const pct = stats?.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
              const colors = { 'Todo': '#9ca3af', 'In Progress': '#3b82f6', 'Review': '#f59e0b', 'Done': '#10b981' };
              return (
                <div key={status} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{status}</span>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: colors[status] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
