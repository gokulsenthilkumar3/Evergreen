import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Chip,
    Box
} from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface MultiSelectFilterProps {
    label: string;
    options: { value: string | number; label: string }[];
    selected: (string | number)[];
    onChange: (selected: (string | number)[]) => void;
    width?: number | string;
}

export default function MultiSelectFilter({
    label,
    options,
    selected,
    onChange,
    width = 200
}: MultiSelectFilterProps) {
    const handleChange = (event: SelectChangeEvent<(string | number)[]>) => {
        const {
            target: { value },
        } = event;
        onChange(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <FormControl sx={{ m: 1, width: width }} size="small">
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={selected}
                onChange={handleChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                            const option = options.find(o => o.value === value);
                            return <Chip key={value} label={option?.label || value} size="small" />;
                        })}
                    </Box>
                )}
                MenuProps={MenuProps}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={selected.indexOf(option.value) > -1} />
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
