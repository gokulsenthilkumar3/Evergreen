import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import {
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  TableView as ExcelIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

export interface ExportButtonsProps {
  onEmail?:  () => void;
  onExcel?:  () => void;
  onPdf?:    () => void;
  onImage?:  () => void;
  onExport?: (type: 'email' | 'excel' | 'pdf' | 'image') => void;
  size?: 'small' | 'medium';
  /** Hide individual buttons by passing false */
  showEmail?: boolean;
  showExcel?: boolean;
  showPdf?:   boolean;
  showImage?: boolean;
}

interface ExportBtn {
  key:     string;
  label:   string;
  icon:    React.ReactNode;
  cls:     string;
  tip:     string;
  onClick: (() => void) | undefined;
  show:    boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onEmail, onExcel, onPdf, onImage, onExport,
  size = 'small',
  showEmail = true,
  showExcel = true,
  showPdf   = true,
  showImage = false,
}) => {
  const buttons: ExportBtn[] = [
    {
      key:    'email',
      label:  'Email',
      icon:   <EmailIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      cls:    'btn-export-email',
      tip:    'Send report via email',
      onClick: onEmail || (onExport ? () => onExport('email') : undefined),
      show:   showEmail,
    },
    {
      key:    'excel',
      label:  'Excel',
      icon:   <ExcelIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      cls:    'btn-export-excel',
      tip:    'Download as Excel spreadsheet (.xlsx)',
      onClick: onExcel || (onExport ? () => onExport('excel') : undefined),
      show:   showExcel,
    },
    {
      key:    'pdf',
      label:  'PDF',
      icon:   <PdfIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      cls:    'btn-export-pdf',
      tip:    'Download as PDF document',
      onClick: onPdf || (onExport ? () => onExport('pdf') : undefined),
      show:   showPdf,
    },
    {
      key:    'image',
      label:  'Image',
      icon:   <ImageIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
      cls:    'btn-export-image',
      tip:    'Download as Image (.png)',
      onClick: onImage || (onExport ? () => onExport('image') : undefined),
      show:   showImage,
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      {buttons
        .filter(b => b.show && b.onClick)
        .map(btn => (
          <Tooltip key={btn.key} title={btn.tip} arrow placement="bottom">
            <Button
              size={size}
              variant="outlined"
              startIcon={btn.icon}
              onClick={btn.onClick}
              className={btn.cls}
              sx={{
                borderWidth: '1.5px !important',
                fontWeight: 600,
                transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                '&:hover': { transform: 'translateY(-1px)', borderWidth: '1.5px !important' },
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              {btn.label}
            </Button>
          </Tooltip>
        ))}
    </Box>
  );
};

export default ExportButtons;
