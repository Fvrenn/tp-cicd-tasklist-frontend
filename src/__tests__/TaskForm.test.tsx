import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders create form by default', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });

  it('renders edit form in edit mode', () => {
    render(<TaskForm onSubmit={vi.fn()} mode="edit" initialValues={{ title: 'Existante' }} />);
    expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    fireEvent.submit(screen.getByTestId('task-form'));
    expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
  });

  it('calls onSubmit with title and description', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Nouvelle tâche' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Ma desc' } });
    fireEvent.submit(screen.getByTestId('task-form'));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Nouvelle tâche', description: 'Ma desc' });
  });

  it('clears form after successful create', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    const titleInput = screen.getByLabelText('Titre');
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.submit(screen.getByTestId('task-form'));
    expect(titleInput).toHaveValue('');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
