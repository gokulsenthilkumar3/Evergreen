import { describe,expect,it } from 'vitest';
import { boundedPng } from './SupportAttachmentPreview';
describe('Attachment image preview limits',()=>{
 it('rejects active content and oversized dimensions before creating a preview',()=>{expect(boundedPng(new TextEncoder().encode('<svg onload="alert(1)"></svg>'))).toBe(false);const bytes=new Uint8Array(24);bytes.set([137,80,78,71,13,10,26,10]);bytes.set([73,72,68,82],12);const view=new DataView(bytes.buffer);view.setUint32(16,100);view.setUint32(20,100);expect(boundedPng(bytes)).toBe(true);view.setUint32(16,50000);expect(boundedPng(bytes)).toBe(false);});
});
