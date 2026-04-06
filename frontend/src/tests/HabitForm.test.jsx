import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HabitForm from '../components/HabitForm';

describe('HabitForm', () => {
  it('renders all fields', () => {
    render(<HabitForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data', () => {
    const onSubmit = vi.fn();
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Run' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'sport' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Run', category: 'sport' })
    );
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<HabitForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('pre-fills fields when editing', () => {
    const initial = { name: 'Meditate', description: 'Daily', frequency: 'daily', category: 'health' };
    render(<HabitForm initial={initial} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue('Meditate');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Daily');
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('requires name field', () => {
    const onSubmit = vi.fn();
    render(<HabitForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
