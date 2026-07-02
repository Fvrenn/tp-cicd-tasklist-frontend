import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
  id: 1,
  title: 'Test',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

function mockFetch(ok: boolean, body: unknown, status = ok ? 200 : 500) {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(bodyStr),
    })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('taskApi', () => {
  it('getTasks returns array', async () => {
    mockFetch(true, [mockTask]);
    const tasks = await getTasks();
    expect(tasks).toEqual([mockTask]);
    expect(fetch).toHaveBeenCalledWith('/api/tasks');
  });

  it('getTasks throws on error response', async () => {
    mockFetch(false, 'Internal Server Error');
    await expect(getTasks()).rejects.toThrow('HTTP 500');
  });

  it('createTask posts and returns new task', async () => {
    mockFetch(true, mockTask);
    const task = await createTask({ title: 'Test' });
    expect(task).toEqual(mockTask);
    expect(fetch).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('updateTask puts and returns updated task', async () => {
    const updated = { ...mockTask, completed: true };
    mockFetch(true, updated);
    const task = await updateTask(1, { completed: true });
    expect(task.completed).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      '/api/tasks/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('deleteTask calls DELETE endpoint', async () => {
    mockFetch(true, null);
    await expect(deleteTask(1)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      '/api/tasks/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('deleteTask throws on error response', async () => {
    mockFetch(false, 'Not Found');
    await expect(deleteTask(99)).rejects.toThrow('HTTP');
  });
});
