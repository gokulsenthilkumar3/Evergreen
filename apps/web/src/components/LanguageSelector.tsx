import { Box, IconButton, Popover, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { SettingsOutlined } from '@mui/icons-material';
import { useState } from 'react';
import TamilOptions from './TamilOptions';
export default function LanguageSelector({
  language,
  onChange,
  disabled = false,
}: {
  language: "en" | "ta";
  onChange: (language: "en" | "ta") => void;
  disabled?: boolean;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
    <ToggleButtonGroup
      value={language}
      exclusive
      size="small"
      disabled={disabled}
      aria-label="Language / மொழி"
      onChange={(_event, next) => {
        if (next && next !== language) { setAnchor(null); onChange(next); }
      }}
      sx={{
        height: 34,
        borderRadius: 1.5,
        "& .MuiToggleButton-root": {
          px: 1,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "none",
          lineHeight: 1.2,
          borderColor: "divider",
          "&.Mui-selected": {
            color: "primary.main",
            bgcolor: "action.selected",
          },
        },
      }}
    >
      <ToggleButton value="en" lang="en" aria-label="English">
        English
      </ToggleButton>
      <ToggleButton value="ta" lang="ta" aria-label="தமிழ்">
        தமிழ்
      </ToggleButton>
    </ToggleButtonGroup>
    {language === 'ta' && <IconButton size="small" aria-label="தமிழ் காட்சி விருப்பங்கள்" aria-haspopup="dialog" aria-expanded={Boolean(anchor)} onClick={event => setAnchor(event.currentTarget)}><SettingsOutlined fontSize="small" /></IconButton>}
    <Popover open={language === 'ta' && Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { p: { xs: 2, sm: 3 }, width: 480, maxWidth: 'calc(100vw - 24px)', maxHeight: 'min(760px, 82dvh)', overflowY: 'auto' }, role: 'dialog', 'aria-label': 'தமிழ் காட்சி விருப்பங்கள்' } }}><TamilOptions /></Popover>
    </Box>
  );
}
