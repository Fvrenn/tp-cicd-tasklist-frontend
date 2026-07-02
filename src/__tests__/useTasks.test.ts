import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

vi.mock('../api/taskApi');

const mockTask = {
  id: 1,
  title: 'Tâche test',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useTasks', () => {
  it('starts with loading=true and loads tasks', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([mockTask]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getTasks fails', async () => {
    vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('Réseau KO'));
    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Réseau KO');
    expect(result.current.tasks).toEqual([]);
  });

  it('addTask prepends new task to the list', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    const newTask = { ...mockTask, id: 2, title: 'Nouvelle' };
    vi.mocked(taskApi.createTask).mockResolvedValue(newTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask({ title: 'Nouvelle' });
    });

    expect(result.current.tasks[0]).toEqual(newTask);
    expect(result.current.tasks).toHaveLength(2);
  });

  it('removeTask removes task from list', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask(1);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it('toggleComplete flips completed state', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
    const toggled = { ...mockTask, completed: true };
    vi.mocked(taskApi.updateTask).mockResolvedValue(toggled);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(1);
    });

    expect(result.current.tasks[0].completed).toBe(true);
    expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
  });
});
