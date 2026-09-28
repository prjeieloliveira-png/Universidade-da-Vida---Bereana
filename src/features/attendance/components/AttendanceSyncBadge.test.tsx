import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttendanceSyncBadge } from './AttendanceSyncBadge';

describe('AttendanceSyncBadge', () => {
  it('renders nothing when synced', () => {
    const { container } = render(<AttendanceSyncBadge status="synced" pendingCount={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing in compact mode when synced', () => {
    const { container } = render(<AttendanceSyncBadge status="synced" pendingCount={0} compact />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders syncing state with pending count', () => {
    render(<AttendanceSyncBadge status="syncing" pendingCount={3} />);
    expect(screen.getByText('Sincronizando 3 registro(s)...')).toBeInTheDocument();
  });

  it('renders offline state with pending count and allows forced sync', () => {
    const handleSync = vi.fn();
    render(
      <AttendanceSyncBadge
        status="offline"
        pendingCount={2}
        onForceSync={handleSync}
      />
    );
    expect(screen.getByText('2 pendente(s)')).toBeInTheDocument();

    const syncButton = screen.getByTitle('Tentar sincronizar agora');
    fireEvent.click(syncButton);
    expect(handleSync).toHaveBeenCalledTimes(1);
  });
});
