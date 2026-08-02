import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { parse, format } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material';

export type GlassDatePickerProps = Omit<TextFieldProps, 'onChange'> & {
    onChange: (e: { target: { value: string } }) => void;
    value: string; // ISO string 'yyyy-MM-dd'
};

export const GlassDatePicker: React.FC<GlassDatePickerProps> = ({
    value,
    onChange,
    label,
    size = 'small',
    fullWidth,
    sx,
    variant,
    ...rest
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Parse incoming 'yyyy-MM-dd' string to Date object
    const dateValue = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;

    const handleDateChange = (newDate: Date | null) => {
        if (!newDate || isNaN(newDate.getTime())) {
            onChange({ target: { value: '' } });
        } else {
            onChange({ target: { value: format(newDate, 'yyyy-MM-dd') } });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label={label}
                value={dateValue}
                onChange={handleDateChange}
                format="dd-MM-yyyy"
                slotProps={{
                    textField: {
                        size: size as any,
                        fullWidth,
                        variant: variant as any,
                        sx: {
                            ...sx,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.8)',
                                },
                            },
                        },
                        ...rest,
                    } as any,
                    desktopPaper: {
                        sx: {
                            borderRadius: '16px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                            bgcolor: isDark ? 'rgba(20, 20, 25, 0.75)' : 'rgba(255, 255, 255, 0.8)',
                            backgroundImage: 'none',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            boxShadow: isDark 
                                ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.05)'
                                : '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255,255,255,0.4)',
                            
                            '& .MuiPickersCalendarHeader-root': {
                                pt: 2,
                                pb: 1,
                                px: 3,
                            },
                            '& .MuiPickersDay-root': {
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                },
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontWeight: 'bold',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                },
                                '&.MuiPickersDay-today': {
                                    border: `1px solid ${theme.palette.primary.main}`,
                                },
                            },
                            '& .MuiDayCalendar-header': {
                                '& .MuiDayCalendar-weekDayLabel': {
                                    color: theme.palette.text.secondary,
                                    fontWeight: 700,
                                }
                            }
                        }
                    },
                    popper: {
                        sx: {
                            zIndex: 1400, // Make sure it sits above modals and app bars
                        }
                    }
                }}
            />
        </LocalizationProvider>
    );
};

export default GlassDatePicker;
