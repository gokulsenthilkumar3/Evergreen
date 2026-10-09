import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    useMediaQuery,
    useTheme,
    TablePagination,
    Stack,
    Divider,
    IconButton,
    Checkbox,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export interface Column<T> {
    id: keyof T | string;
    label: string;
    align?: 'left' | 'center' | 'right';
    format?: (value: any, row: T) => React.ReactNode;
    hideOnMobile?: boolean; // If true, this field won't show in the main card content (maybe only in expand?)
    minWidth?: number;
}

interface ResponsiveTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    keyField: keyof T;
    loading?: boolean;
    page?: number;
    rowsPerPage?: number;
    count?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    onRowClick?: (row: T) => void;
    mobileMainField?: keyof T;
    mobileSecondaryField?: keyof T;
    selectable?: boolean;
    selected?: (string | number)[];
    onSelectionChange?: (selected: (string | number)[]) => void;
}

export default function ResponsiveTable<T extends { [key: string]: any }>({
    columns,
    rows,
    keyField,
    loading = false,
    page = 0,
    rowsPerPage = 10,
    count = rows.length,
    onPageChange,
    onRowsPerPageChange,
    onRowClick,
    mobileMainField,
    mobileSecondaryField,
    selectable = false,
    selected = [],
    onSelectionChange,
}: ResponsiveTableProps<T>) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChangePage = (_event: unknown, newPage: number) => {
        onPageChange?.(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        onRowsPerPageChange?.(parseInt(event.target.value, 10));
        onPageChange?.(0);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n[keyField] as string | number);
            onSelectionChange?.(newSelecteds);
            return;
        }
        onSelectionChange?.([]);
    };

    const handleClick = (event: React.MouseEvent, id: string | number) => {
        event.stopPropagation();
        const selectedIndex = selected.indexOf(id);
        let newSelected: (string | number)[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        onSelectionChange?.(newSelected);
    };

    const isSelected = (id: string | number) => selected.indexOf(id) !== -1;





    // Mobile Card View Configuration
    const renderMobileCard = (row: T) => {
        const mainValue = mobileMainField ? row[mobileMainField] : 'Item';
        const secondaryValue = mobileSecondaryField ? row[mobileSecondaryField] : '';
        const id = String(row[keyField]);

        const mainCol = columns.find(c => c.id === mobileMainField);
        const secondaryCol = columns.find(c => c.id === mobileSecondaryField);
        const actionsCol = columns.find(c => c.id === 'actions');

        return (
            <Card variant="outlined" sx={{ mb: 2 }} key={id}>
                <CardContent onClick={() => onRowClick?.(row)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {selectable && (
                                <Checkbox
                                    checked={isSelected(id)}
                                    onClick={(e) => handleClick(e, id)}
                                    size="medium"
                                    sx={{ p: 0.5, mr: 0.5 }}
                                />
                            )}
                            <Typography variant="h6" component="div">
                                {mainCol?.format ? mainCol.format(mainValue, row) : mainValue}
                            </Typography>
                        </Box>
                        {secondaryValue && (
                            <Typography color="text.secondary" variant="body2">
                                {secondaryCol?.format ? secondaryCol.format(secondaryValue, row) : secondaryValue}
                            </Typography>
                        )}
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <Stack spacing={1}>
                        {columns.map((col) => {
                            if (col.id === mobileMainField || col.id === mobileSecondaryField || col.id === 'actions') return null;
                            const value = row[col.id as string];
                            return (
                                <Box key={String(col.id)} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                        {col.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'right' }}>
                                        {col.format ? col.format(value, row) : value}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>
                    {actionsCol && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {actionsCol.format ? actionsCol.format(null, row) : null}
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return <Typography sx={{ p: 2, textAlign: 'center' }}>Loading...</Typography>;
    }

    if (rows.length === 0) {
        return <Typography sx={{ p: 2, textAlign: 'center' }}>No data available</Typography>;
    }

    if (isMobile) {
        return (
            <Box>
                {rows.map((row) => renderMobileCard(row))}
                {onPageChange && (
                    <TablePagination
                        component="div"
                        count={count}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                )}
            </Box>
        );
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader aria-label="responsive table">
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selected.length > 0 && selected.length < rows.length}
                                        checked={rows.length > 0 && selected.length === rows.length}
                                        onChange={handleSelectAllClick}
                                        inputProps={{
                                            'aria-label': 'select all rows',
                                        }}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell
                                    key={String(column.id)}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => {
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={String(row[keyField])}
                                    onClick={() => onRowClick?.(row)}
                                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                >
                                    {selectable && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isSelected(row[keyField] as string | number)}
                                                onClick={(e) => handleClick(e, row[keyField] as string | number)}
                                                inputProps={{
                                                    'aria-labelledby': String(row[keyField]),
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => {
                                        const value = row[column.id as string];
                                        return (
                                            <TableCell key={String(column.id)} align={column.align}>
                                                {column.format ? column.format(value, row) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {onPageChange && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </Paper>
    );
}
