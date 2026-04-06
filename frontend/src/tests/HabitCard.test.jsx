import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HabitCard from '../components/HabitCard';

vi.mock('../api/client', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const habit = {
  id: 1,
  name: 'Morning run',
  description: 'Before breakfast',
  category: 'sport',
  frequency: 'daily',
  streak: 3,
};

describe('HabitCard', () => {
  it('renders habit name and category', () => {
    render(<HabitCard habit={habit} completedToday={false} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Morning run')).toBeInTheDocument();
    expect(screen.getByText(/sport/i)).toBeInTheDocument();
  });

  it('shows streak', () => {
    render(<HabitCard habit={habit} completedToday={false} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/3d/)).toBeInTheDocument();
  });

  it('applies line-through when completed', () => {
    render(<HabitCard habit={habit} completedToday={true} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Morning run')).toHaveClass('line-through');
  });

  it('calls onToggle after checking', async () => {
    const onToggle = vi.fn();
    render(<HabitCard habit={habit} completedToday={false} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => expect(onToggle).toHaveBeenCalled());
  });

  it('calls onEdit when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<HabitCard habit={habit} completedToday={false} onToggle={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(habit);
  });

  it('toggles calendar on 📅 click', async () => {
    render(<HabitCard habit={habit} completedToday={false} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/Mon/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Toggle calendar'));
    await waitFor(() => expect(screen.getByText('Mon')).toBeInTheDocument());
  });
});
