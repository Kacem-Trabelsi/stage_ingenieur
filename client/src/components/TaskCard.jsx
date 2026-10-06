import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Trash2, 
  Edit3, 
  ArrowRight,
  MoreVertical 
} from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-completed">Terminé</span>;
      case 'in_progress':
        return <span className="badge badge-in_progress">En cours</span>;
      default:
        return <span className="badge badge-todo">À faire</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-high">Haute</span>;
      case 'medium':
        return <span className="badge badge-medium">Moyenne</span>;
      default:
        return <span className="badge badge-low">Faible</span>;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const nextStatusMap = {
    todo: 'in_progress',
    in_progress: 'completed',
    completed: 'todo',
  };

  const handleQuickStatus = () => {
    onStatusChange(task._id, nextStatusMap[task.status]);
  };

  return (
    <div className="glass-card glass-card-hover" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top indicator bar for priority */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: task.priority === 'high' ? 'var(--accent-rose)' : task.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
      }} />

      {/* Header: Badges & Actions */}
      <div className="flex-between">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {getStatusBadge(task.status)}
          {getPriorityBadge(task.priority)}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => onEdit(task)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem' }}
            title="Modifier"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
            title="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Body: Title & Description */}
      <div>
        <h4 style={{
          fontSize: '1.05rem',
          marginBottom: '0.35rem',
          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
          color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>
          {task.title}
        </h4>
        {task.description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Footer: Due date & Quick Status Switch */}
      <div className="flex-between" style={{
        marginTop: 'auto',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={14} color={isOverdue ? 'var(--accent-rose)' : 'currentColor'} />
          <span style={{ color: isOverdue ? 'var(--accent-rose)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Pas d\'échéance'}
          </span>
        </div>

        <button
          onClick={handleQuickStatus}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
          title="Passer à l'état suivant"
        >
          <span>
            {task.status === 'todo' ? 'Démarrer' : task.status === 'in_progress' ? 'Terminer' : 'Réouvrir'}
          </span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
