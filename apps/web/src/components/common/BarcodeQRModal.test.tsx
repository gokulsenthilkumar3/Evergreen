import { describe, expect, it } from 'vitest';
import { escapeHtml, labelPrintDocument } from './BarcodeQRModal';

describe('label printing', () => {
  it('escapes every character that can open markup', () => {
    expect(escapeHtml(`</title><script>alert("x")</script>&'`)).toBe('&lt;/title&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39;');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(42)).toBe('42');
  });

  it('cannot inject markup into the print window through a batch code or label type', () => {
    const hostile = '</title><script>window.stolen=1</script>';
    const html = labelPrintDocument(hostile, hostile, '<div class="label-card">Cotton lot</div>');

    expect(html).not.toContain('<script>window.stolen=1</script>');
    expect(html).toContain('<title>&lt;/title&gt;&lt;script&gt;window.stolen=1&lt;/script&gt; Label - &lt;/title&gt;&lt;script&gt;window.stolen=1&lt;/script&gt;</title>');
    // The only script in the document is the template's own print trigger.
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html.match(/<\/title>/g)).toHaveLength(1);
  });

  it('keeps the rendered label and the print trigger', () => {
    const html = labelPrintDocument('BATCH', 'EG-2026-001', '<div class="label-card">Cotton lot</div>');
    expect(html).toContain('<title>BATCH Label - EG-2026-001</title>');
    expect(html).toContain('<div class="label-card">Cotton lot</div>');
    expect(html).toContain('window.print()');
  });
});
