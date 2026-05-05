import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTasks, updateTask } from '../utils/api';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['Todo', 'In Progress', 'Review', 'Done'];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getMyTasks()
      .then(res => setTasks(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks;

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
      </div>

      <div className="filters-bar">
        <button className={`btn ${!filter ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter('')}>All</button>
        {STATUSES.map(s => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3>{filter ? `No ${filter} tasks` : 'No tasks assigned to you'}</h3>
          <p>Tasks assigned to you will appear here</p>
        </div>
      ) : (
        <div className="card">
          {filtered.map((task, i) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done';
            return (
              <div key={task._id} style={{
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: task.status === 'Done' ? 'var(--gray-400)' : 'var(--gray-800)', textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {task.project && (
                      <Link to={`/projects/${task.project._id}`} style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                        onClick={e => e.stopPropagation()}>
                        {task.project.name}
                      </Link>
                    )}
                    <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'var(--gray-500)', fontWeight: isOverdue ? 500 : 400 }}>
                        {isOverdue ? '⚠ Overdue: ' : 'Due: '}{format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '5px 8px', fontSize: 12 }}
                  value={task.status}
                  onChange={e => handleStatusChange(task._id, e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
