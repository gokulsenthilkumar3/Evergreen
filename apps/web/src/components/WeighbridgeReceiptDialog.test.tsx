import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import WeighbridgeReceiptDialog from './WeighbridgeReceiptDialog';
import api from '../utils/api';
vi.mock('../utils/api', () => ({ default: { post: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const fill = () => {
  for (const [label, value] of [['Supplier', 'Pilot supplier'], ['Bales', '50'], ['Gross weight (kg)', '14520'], ['Tare weight (kg)', '4200'], ['Moisture content (%)', '9.2']])
    fireEvent.change(screen.getByLabelText(new RegExp(label.replace(/[()%]/g, '\\$&'))), { target: { value } });
};

it('defaults to pending settlement and preserves the lot reference when retrying', async () => {
  vi.mocked(api.post).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: {} });
  const onSaved = vi.fn();
  render(<WeighbridgeReceiptDialog onSaved={onSaved} onClose={vi.fn()} />);
  fill();
  expect(screen.getByText('Physical stock received: 10320.00 kg')).toBeInTheDocument();
  expect(screen.getByText('Billable weight: pending contract confirmation')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }));
  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save receipt' })).toBeEnabled());
  const first = vi.mocked(api.post).mock.calls[0][1];
  expect(first).toMatchObject({ method: 'PENDING', grossWeightKg: 14520, tareWeightKg: 4200 });
  expect(first).not.toHaveProperty('standardMoistureBase');
  fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(vi.mocked(api.post).mock.calls[1][1]).toEqual(first);
});

it('requires contract evidence before applying a deduction', async () => {
  vi.mocked(api.post).mockResolvedValue({ data: {} });
  render(<WeighbridgeReceiptDialog onSaved={vi.fn()} onClose={vi.fn()} />);
  fill();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Deduction policy' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Agreed excess percentage deduction' }));
  fireEvent.change(screen.getByLabelText(/Agreed baseline/), { target: { value: '8.5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }));
  expect(api.post).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Contract reference/), { target: { value: 'Supplier contract 001' } });
  expect(screen.getByText('Moisture deduction: 72.24 kg')).toBeInTheDocument();
  expect(screen.getByText('Billable weight: 10247.76 kg')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save receipt' }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/inventory/inward/weighbridge-sync', expect.objectContaining({ method: 'EXCESS_PERCENTAGE', standardMoistureBase: 8.5, contractReference: 'Supplier contract 001' })));
});
