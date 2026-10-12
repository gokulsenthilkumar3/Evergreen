/**
 * Request bodies for the costing endpoints. Only the entered inputs are sent:
 * the server works out electricity, labour and packaging totals itself and
 * records who saved the entry from the session.
 */
type FormValue = string | number | null | undefined;

const toNumber = (value: FormValue): number => Number.parseFloat(String(value ?? ''));
const toShifts = (value: FormValue): number => toNumber(value) || 1;

export const ebCostPayload = (date: string, form: { unitsConsumed: FormValue; ratePerUnit: FormValue; noOfShifts: FormValue }) => ({
  date,
  unitsConsumed: toNumber(form.unitsConsumed),
  ratePerUnit: toNumber(form.ratePerUnit),
  noOfShifts: toShifts(form.noOfShifts),
});

export const employeeCostPayload = (date: string, form: { workers: FormValue; workerRate: FormValue; noOfShifts: FormValue; overtime: FormValue }) => ({
  date,
  workers: toNumber(form.workers),
  rate: toNumber(form.workerRate),
  noOfShifts: toShifts(form.noOfShifts),
  overtime: toNumber(form.overtime) || 0,
});

export const packagingCostPayload = (date: string, yarnProduced: number, ratePerKg: FormValue) => ({
  date,
  yarnProduced,
  ratePerKg: toNumber(ratePerKg),
});

export const maintenanceCostPayload = (date: string, form: { description: string; totalCost: FormValue; ratePerKg: FormValue }) => {
  const ratePerKg = toNumber(form.ratePerKg);
  return {
    date,
    description: form.description || 'Daily Maintenance',
    totalCost: toNumber(form.totalCost),
    ...(Number.isFinite(ratePerKg) ? { ratePerKg } : {}),
  };
};

export const expensePayload = (date: string, form: { title: string; amount: FormValue; description: string; type: string }) => ({
  date,
  title: form.title.trim(),
  amount: toNumber(form.amount),
  type: form.type,
  ...(form.description ? { description: form.description } : {}),
});
