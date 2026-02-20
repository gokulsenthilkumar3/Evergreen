import React from 'react';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
  TableView as ExcelIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  FileDownload as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon2,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { type SvgIconProps } from '@mui/material';

// Standardized icon colors by action type
export const iconColors = {
  create: 'primary',
  edit: 'info',
  delete: 'error',
  save: 'success',
  export: 'secondary',
  email: 'info',
  search: 'action',
  refresh: 'action',
  close: 'action',
  back: 'action',
  next: 'action',
  download: 'primary',
  share: 'info',
  print: 'action',
  payment: 'success',
  upload: 'primary',
  view: 'info',
  copy: 'secondary',
} as const;

// Icon components with standardized colors
export const StandardIcons = {
  // CRUD Operations
  Add: (props: SvgIconProps) => <AddIcon color="primary" {...props} />,
  Edit: (props: SvgIconProps) => <EditIcon color="info" {...props} />,
  Delete: (props: SvgIconProps) => <DeleteIcon color="error" {...props} />,
  Save: (props: SvgIconProps) => <SaveIcon color="success" {...props} />,
  View: (props: SvgIconProps) => <ViewIcon color="info" {...props} />,
  Copy: (props: SvgIconProps) => <CopyIcon color="secondary" {...props} />,
  
  // Export/Import
  PDF: (props: SvgIconProps) => <PdfIcon color="error" {...props} />,
  Excel: (props: SvgIconProps) => <ExcelIcon color="success" {...props} />,
  Email: (props: SvgIconProps) => <EmailIcon color="info" {...props} />,
  Download: (props: SvgIconProps) => <DownloadIcon color="primary" {...props} />,
  Upload: (props: SvgIconProps) => <UploadIcon color="primary" {...props} />,
  Print: (props: SvgIconProps) => <PrintIcon color="action" {...props} />,
  Share: (props: SvgIconProps) => <ShareIcon color="info" {...props} />,
  
  // Navigation
  Search: (props: SvgIconProps) => <SearchIcon color="action" {...props} />,
  Refresh: (props: SvgIconProps) => <RefreshIcon color="action" {...props} />,
  Close: (props: SvgIconProps) => <CloseIcon color="action" {...props} />,
  Back: (props: SvgIconProps) => <BackIcon color="action" {...props} />,
  Next: (props: SvgIconProps) => <NextIcon color="action" {...props} />,
  
  // Actions
  Payment: (props: SvgIconProps) => <PaymentIcon color="success" {...props} />,
  Filter: (props: SvgIconProps) => <FilterIcon color="action" {...props} />,
  Sort: (props: SvgIconProps) => <SortIcon color="action" {...props} />,
  More: (props: SvgIconProps) => <MoreIcon color="action" {...props} />,
  Settings: (props: SvgIconProps) => <SettingsIcon color="action" {...props} />,
  
  // Status
  Success: (props: SvgIconProps) => <CheckIcon color="success" {...props} />,
  Error: (props: SvgIconProps) => <CancelIcon color="error" {...props} />,
  Warning: (props: SvgIconProps) => <WarningIcon color="warning" {...props} />,
  Info: (props: SvgIconProps) => <InfoIcon color="info" {...props} />,
};

export default StandardIcons;
