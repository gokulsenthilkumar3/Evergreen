import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Tutorial from '../pages/Tutorial';
vi.mock('../components/BusinessFlowGuide', () => ({ default: () => <div>Business handoff guide</div> }));
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('user', JSON.stringify({ username: 'learner' })); });
afterEach(cleanup);
describe('Learning path improvements', () => {
  it('searches the new activation and integration lessons', () => {
    render(<Tutorial />);
    fireEvent.change(screen.getByLabelText('Search learning paths'), { target: { value: 'signed offline deadline' } });
    expect(screen.getByRole('button', { name: /Activation & Secure Access/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Costing & Expenses/ })).not.toBeInTheDocument();
  });
  it('retains completion per username and allows revisiting a completed step', async () => {
    const { unmount } = render(<Tutorial />);
    fireEvent.click(screen.getByRole('button', { name: /Got it/ }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('evergreen-tutorial-v2-learner') || '{}')['getting-started']).toContain(0));
    unmount(); render(<Tutorial />);
    expect(screen.getAllByText('25%').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Login & Authentication' }));
    expect(screen.getByText(/Use your username and password to log in/)).toBeInTheDocument();
  });
});
