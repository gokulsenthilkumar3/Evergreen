import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders an accessible modal and invokes both actions', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Delete outward entry?"
        message="This restores inventory and cannot be undone."
        confirmText="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
        severity="error"
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete outward entry?', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('This restores inventory and cannot be undone.')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not expose dialog content while closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Hidden confirmation"
        message="Hidden content"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });
});
