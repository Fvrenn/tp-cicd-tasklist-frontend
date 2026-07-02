import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
  id: 1,
  title: 'Ma tâche',
  description: 'Une description',
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
  it('renders task title and description', () => {
    render(
      <TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
    expect(screen.getByText('Une description')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(
      <TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('shows edit form when edit button is clicked', () => {
    render(
      <TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    fireEvent.click(screen.getByTitle('Modifier'));
    expect(screen.getByDisplayValue('Ma tâche')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
  });

  it('calls onEdit with new values on save', () => {
    const onEdit = vi.fn();
    render(
      <TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
    );
    fireEvent.click(screen.getByTitle('Modifier'));
    const titleInput = screen.getByDisplayValue('Ma tâche');
    fireEvent.change(titleInput, { target: { value: 'Titre modifié' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(onEdit).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Titre modifié' }));
  });

  it('cancels edit without calling onEdit', () => {
    const onEdit = vi.fn();
    render(
      <TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
    );
    fireEvent.click(screen.getByTitle('Modifier'));
    fireEvent.click(screen.getByText('Annuler'));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
  });

  it('requires double-click to delete (confirmation)', () => {
    const onDelete = vi.fn();
    render(
      <TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
    );
    const deleteBtn = screen.getByTitle('Supprimer');
    fireEvent.click(deleteBtn);
    expect(onDelete).not.toHaveBeenCalled();
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('applies completed class when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskItem task={completedTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
  });
});
