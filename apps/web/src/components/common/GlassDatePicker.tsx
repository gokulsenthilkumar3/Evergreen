import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import {
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  ArrowDropDown as DropIcon,
  Refresh as ClearIcon,
  CalendarToday as TodayIcon,
} from '@mui/icons-material';

export type GlassDatePickerProps = {
  value: string; // 'yyyy-MM-dd'
  onChange: (e: { target: { value: string } }) => void;
  label?: React.ReactNode;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: any;
  [key: string]: any;
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function parseDate(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val + 'T12:00:00');
  return isNaN(d.getTime()) ? null : d;
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDisplay(val: string): string {
  if (!val) return '';
  const d = parseDate(val);
  if (!d) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const GlassDatePicker: React.FC<GlassDatePickerProps> = ({
  value, onChange, label, size = 'small', fullWidth, sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => {
    const d = parseDate(value);
    return d || new Date();
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedDate = parseDate(value);

  // Build calendar grid
  const year  = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; thisMonth: boolean; date: Date }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, thisMonth: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, thisMonth: true, date: new Date(year, month, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, thisMonth: false, date: new Date(year, month + 1, d) });
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isToday = (d: Date) => isSameDay(d, new Date());

  // --- Neumorphic / Claymorphic styling ---
  const neu = {
    card: isDark
      ? {
          background: '#1a2236',
          boxShadow: '10px 10px 28px rgba(0,0,0,0.55), -5px -5px 16px rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }
      : {
          background: '#eef1f8',
          boxShadow: '10px 10px 28px rgba(163,177,198,0.65), -7px -7px 18px rgba(255,255,255,0.97)',
          border: '1px solid rgba(255,255,255,0.5)',
        },
    btn: isDark
      ? {
          background: '#1e293b',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5), -3px -3px 8px rgba(255,255,255,0.04)',
          color: '#94a3b8',
          border: '1px solid rgba(255,255,255,0.06)',
        }
      : {
          background: '#eef1f8',
          boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.97)',
          color: '#6b7280',
          border: '1px solid rgba(255,255,255,0.7)',
        },
    header: isDark
      ? {
          background: '#1e293b',
          boxShadow: '4px 4px 12px rgba(0,0,0,0.45), -3px -3px 8px rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }
      : {
          background: '#eef1f8',
          boxShadow: '4px 4px 12px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.97)',
          border: '1px solid rgba(255,255,255,0.7)',
        },
  };

  const selectedColor = '#3b82f6'; // vivid blue as in image

  return (
    <Box ref={wrapRef} sx={{ position: 'relative', display: 'inline-flex', width: fullWidth ? '100%' : undefined, ...sx }}>
      {/* Trigger input */}
      <Box
        onClick={() => setOpen(p => !p)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: size === 'small' ? 0.75 : 1.25,
          borderRadius: '10px',
          cursor: 'pointer',
          width: fullWidth ? '100%' : 'auto',
          minWidth: 145,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <Box sx={{ flex: 1 }}>
          {label && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.68rem', lineHeight: 1, mb: 0.3 }}>
              {label}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: value ? 'text.primary' : 'text.secondary', fontWeight: value ? 500 : 400, fontSize: size === 'small' ? '0.82rem' : '0.875rem' }}>
            {value ? formatDisplay(value) : 'Pick a date'}
          </Typography>
        </Box>
        <DropIcon sx={{ color: 'text.secondary', fontSize: 18, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </Box>

      {/* Calendar Popup */}
      {open && (
        <Box
          className="anim-pop-in"
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 1500,
            borderRadius: '24px',
            padding: '20px',
            minWidth: 300,
            ...neu.card,
          }}
        >
          {/* Month/Year Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 2, py: 0.75, borderRadius: '12px', cursor: 'pointer',
                ...neu.header,
                transition: 'box-shadow 0.2s',
                '&:hover': { filter: 'brightness(1.05)' },
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {MONTHS[month]}, {year}
              </Typography>
              <DropIcon sx={{ fontSize: 16, color: isDark ? '#64748b' : '#94a3b8' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <UpIcon />, fn: () => setView(new Date(year, month - 1, 1)) },
                { icon: <DownIcon />, fn: () => setView(new Date(year, month + 1, 1)) },
              ].map(({ icon, fn }, i) => (
                <IconButton
                  key={i}
                  size="small"
                  onClick={fn}
                  sx={{
                    ...neu.btn,
                    width: 36, height: 36,
                    borderRadius: '12px',
                    transition: 'all 0.15s',
                    '&:hover': { filter: 'brightness(1.08)', transform: 'scale(1.06)' },
                    '&:active': { transform: 'scale(0.95)' },
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Day-of-week labels */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
            {DAYS.map(d => (
              <Typography key={d} align="center" sx={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#475569' : '#94a3b8', py: 0.5 }}>
                {d}
              </Typography>
            ))}
          </Box>

          {/* Day cells */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {cells.map((cell, idx) => {
              const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
              const today = isToday(cell.date);
              return (
                <Box
                  key={idx}
                  onClick={() => {
                    onChange({ target: { value: toISO(cell.date) } });
                    setOpen(false);
                  }}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 700 : today ? 600 : cell.thisMonth ? 500 : 400,
                    color: isSelected
                      ? '#fff'
                      : !cell.thisMonth
                      ? (isDark ? '#334155' : '#c8d0dc')
                      : today
                      ? selectedColor
                      : (isDark ? '#e2e8f0' : '#1e293b'),
                    background: isSelected
                      ? `linear-gradient(145deg, ${selectedColor}, #2563eb)`
                      : 'transparent',
                    boxShadow: isSelected
                      ? `0 6px 16px ${selectedColor}55, 0 2px 6px ${selectedColor}44`
                      : 'none',
                    transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                    border: today && !isSelected ? `1.5px solid ${selectedColor}` : 'none',
                    '&:hover': isSelected
                      ? { filter: 'brightness(1.08)' }
                      : {
                          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                          transform: 'scale(1.08)',
                        },
                    '&:active': { transform: 'scale(0.93)' },
                  }}
                >
                  {cell.day}
                </Box>
              );
            })}
          </Box>

          {/* Footer: Clear / Today */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5, gap: 1 }}>
            <Box
              onClick={() => { onChange({ target: { value: '' } }); setOpen(false); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 0.9, borderRadius: '14px', cursor: 'pointer',
                ...neu.btn,
                transition: 'all 0.18s',
                '&:hover': { filter: 'brightness(1.08)', transform: 'scale(1.03)' },
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <ClearIcon sx={{ fontSize: 16, color: selectedColor }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: selectedColor }}>Clear</Typography>
            </Box>
            <Box
              onClick={() => { onChange({ target: { value: toISO(new Date()) } }); setOpen(false); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 0.9, borderRadius: '14px', cursor: 'pointer',
                ...neu.btn,
                transition: 'all 0.18s',
                '&:hover': { filter: 'brightness(1.08)', transform: 'scale(1.03)' },
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              <TodayIcon sx={{ fontSize: 16, color: selectedColor }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: selectedColor }}>Today</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GlassDatePicker;
