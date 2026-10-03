import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Grid,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  QrCode2 as QrIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export type LabelType = 'BATCH' | 'BAG' | 'OUTWARD';

export interface BarcodeQRModalProps {
  open: boolean;
  onClose: () => void;
  type: LabelType;
  title: string;
  code: string;
  qrPayload: string;
  metadata: Array<{ label: string; value: string | number }>;
  millName?: string;
}

/**
 * Procedural SVG 1D Barcode Generator (Code128-style visualization)
 */
const SimpleSVGBarcode: React.FC<{ value: string; height?: number }> = ({ value, height = 45 }) => {
  // Generate deterministic bar widths from characters in string
  const bars: Array<{ width: number; isBlack: boolean }> = [];
  let isBlack = true;
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const pattern = [(charCode % 3) + 1, ((charCode >> 2) % 3) + 1, ((charCode >> 4) % 2) + 1];
    for (const w of pattern) {
      bars.push({ width: w, isBlack });
      isBlack = !isBlack;
    }
  }

  // Calculate total width
  const totalWidth = bars.reduce((s, b) => s + b.width, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 1 }}>
      <svg
        width={Math.min(totalWidth * 2.5, 300)}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        style={{ display: 'block' }}
      >
        {bars.map((bar, idx) => {
          if (!bar.isBlack) return null;
          const x = bars.slice(0, idx).reduce((s, b) => s + b.width, 0);
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={bar.width}
              height={height}
              fill="#000000"
            />
          );
        })}
      </svg>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          letterSpacing: 2,
          fontWeight: 700,
          color: '#111827',
          mt: 0.5,
          fontSize: '0.75rem',
        }}
      >
        *{value}*
      </Typography>
    </Box>
  );
};

export const BarcodeQRModal: React.FC<BarcodeQRModalProps> = ({
  open,
  onClose,
  type,
  title,
  code,
  qrPayload,
  metadata,
  millName = 'EverGreen One Textiles',
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const printWindow = window.open('', '_blank', 'width=650,height=750');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print barcode labels.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type} Label - ${code}</title>
          <style>
            @page {
              size: 4in 3in;
              margin: 0.15in;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #111827;
              margin: 0;
              padding: 10px;
              background: #fff;
            }
            .label-card {
              border: 2px solid #000;
              padding: 12px;
              border-radius: 6px;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .title {
              font-size: 16px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .code {
              font-size: 18px;
              font-weight: 900;
              font-family: monospace;
              letter-spacing: 1px;
            }
            .content {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .meta-table {
              width: 100%;
              font-size: 12px;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 3px 0;
            }
            .meta-label {
              font-weight: bold;
              color: #4b5563;
              width: 40%;
            }
            .barcode-footer {
              text-align: center;
              margin-top: 8px;
              border-top: 1px dashed #666;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          ${printAreaRef.current.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrPayload);
    toast.success('✓ Traceability payload copied to clipboard');
  };

  const typeColorMap: Record<LabelType, 'primary' | 'success' | 'warning'> = {
    BATCH: 'primary',
    BAG: 'success',
    OUTWARD: 'warning',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <QrIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Chip label={type} size="small" color={typeColorMap[type] || 'default'} sx={{ fontWeight: 700 }} />
        </Box>
        <Button size="small" onClick={onClose} sx={{ minWidth: 36, p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
        {/* Printable Label Preview Box */}
        <Box ref={printAreaRef}>
          <Paper
            elevation={2}
            className="label-card"
            sx={{
              p: 2.5,
              backgroundColor: '#ffffff',
              color: '#111827',
              borderRadius: 2,
              border: '2px solid #111827',
            }}
          >
            {/* Label Header */}
            <Box className="header" sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', pb: 1, mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {millName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4b5563' }}>
                  Industrial Traceability Tag
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827' }}>
                {new Date().toLocaleDateString('en-IN')}
              </Typography>
            </Box>

            {/* Code identifier */}
            <Box sx={{ mb: 1.5, textAlign: 'center', backgroundColor: '#f3f4f6', py: 0.5, borderRadius: 1 }}>
              <Typography variant="body1" className="code" sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1.5, color: '#111827' }}>
                {code}
              </Typography>
            </Box>

            {/* Grid with QR Code and Metadata */}
            <Grid container spacing={2} alignItems="center" className="content">
              <Grid size={{ xs: 5 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 1.5,
                    display: 'inline-flex',
                  }}
                >
                  <QRCodeSVG
                    value={qrPayload}
                    size={120}
                    level="M"
                    includeMargin={false}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 7 }}>
                <table className="meta-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <tbody>
                    {metadata.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ fontWeight: 700, color: '#4b5563', padding: '3px 0' }} className="meta-label">
                          {item.label}:
                        </td>
                        <td style={{ fontWeight: 800, color: '#111827', textAlign: 'right', padding: '3px 0' }}>
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Grid>
            </Grid>

            {/* Barcode Footer */}
            <Divider sx={{ my: 1.5, borderColor: '#d1d5db' }} />
            <Box className="barcode-footer">
              <SimpleSVGBarcode value={code} height={38} />
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button startIcon={<CopyIcon />} variant="outlined" size="small" onClick={handleCopy}>
          Copy Payload
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<PrintIcon />} variant="contained" color="primary" onClick={handlePrint}>
          Print Label (4"×3")
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeQRModal;
