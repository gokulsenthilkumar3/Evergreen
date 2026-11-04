import { createConnection } from 'node:net';
export type ScanResult = 'CLEAN' | 'INFECTED' | 'QUARANTINED';
/** ClamAV INSTREAM; unavailable/malformed/error replies never release an upload. */
export async function scanSupportAttachment(
  bytes: Buffer,
): Promise<ScanResult> {
  const host = process.env.HELPDESK_CLAMAV_HOST;
  const port = Number(process.env.HELPDESK_CLAMAV_PORT || 3310);
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535)
    return 'QUARANTINED';
  // clamd TCP has no authentication or TLS. Only a host-local daemon is supported.
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) return 'QUARANTINED';
  return new Promise((resolve) => {
    let result = '',
      finished = false;
    const socket = createConnection({ host, port });
    const finish = (status: ScanResult) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(status);
    };
    socket.setTimeout(10000, () => finish('QUARANTINED'));
    socket.on('error', () => finish('QUARANTINED'));
    socket.on('end', () => finish('QUARANTINED'));
    socket.on('connect', () => {
      socket.write(Buffer.from('zINSTREAM\0'));
      for (let offset = 0; offset < bytes.length; offset += 65536) {
        const chunk = bytes.subarray(offset, offset + 65536),
          length = Buffer.alloc(4);
        length.writeUInt32BE(chunk.length);
        socket.write(length);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
    socket.on('data', (data) => {
      result += data.toString('utf8');
      if (result.length > 4096) return finish('QUARANTINED');
      if (result.includes('\0')) {
        const line = result.slice(0, result.indexOf('\0'));
        finish(
          line === 'stream: OK'
            ? 'CLEAN'
            : /^stream: .+ FOUND$/.test(line)
              ? 'INFECTED'
              : 'QUARANTINED',
        );
      }
    });
  });
}
