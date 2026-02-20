/**
 * Print Styles for EverGreen Application
 * Optimizes pages for printing - hides UI elements, shows data clearly
 */

export const printStyles = `
/* Print optimization */
@media print {
  /* Hide navigation and UI elements */
  .MuiAppBar-root,
  .MuiDrawer-root,
  .no-print,
  button,
  .MuiIconButton-root,
  .MuiFab-root,
  [aria-label="open drawer"],
  [aria-label="Close dialog"] {
    display: none !important;
  }

  /* Reset layout for print */
  .MuiBox-root {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Ensure tables print properly */
  .MuiTableContainer-root {
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }

  .MuiTable-root {
    width: 100% !important;
    table-layout: fixed !important;
  }

  /* Page breaks */
  .page-break {
    page-break-before: always;
  }

  .page-break-after {
    page-break-after: always;
  }

  .no-page-break {
    page-break-inside: avoid;
  }

  /* Print header */
  .print-header {
    display: block !important;
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  }

  .print-header h1 {
    font-size: 18pt;
    margin: 0;
  }

  .print-header p {
    font-size: 10pt;
    color: #666;
    margin: 5px 0 0 0;
  }

  /* Print footer */
  .print-footer {
    display: block !important;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8pt;
    color: #666;
    border-top: 1px solid #ccc;
    padding-top: 10px;
  }

  /* Ensure background colors print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Typography adjustments */
  body {
    font-size: 10pt;
    line-height: 1.4;
    color: #000;
    background: #fff;
  }

  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    margin-top: 10pt;
    margin-bottom: 5pt;
  }

  p {
    orphans: 3;
    widows: 3;
  }

  /* Table optimizations */
  thead {
    display: table-header-group;
  }

  tr {
    page-break-inside: avoid;
  }

  td, th {
    page-break-inside: avoid;
  }

  /* Links - show URL after link text */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 8pt;
    color: #666;
  }

  a[href^="#"]:after {
    content: "";
  }
}

/* Screen-only elements */
@media screen {
  .print-only {
    display: none !important;
  }

  .print-header,
  .print-footer {
    display: none !important;
  }
}
`;

export default printStyles;
