// Read-only inspection of published brand assets; SVG files are added with apply_patch.
import { inflateRawSync } from 'node:zlib';

const [url, requestedEntry] = process.argv.slice(2);
if (!url) throw new Error('Pass a published asset URL and optionally a ZIP entry.');
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`${response.status}: ${url}`);
const data = Buffer.from(await response.arrayBuffer());
if (data.readUInt32LE(0) === 0x04034b50) {
  let end = data.length - 22;
  while (end >= 0 && data.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error('ZIP central directory not found.');
  const entries = [];
  let offset = data.readUInt32LE(end + 16);
  while (data.readUInt32LE(offset) === 0x02014b50) {
    const nameLength = data.readUInt16LE(offset + 28);
    const name = data.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    entries.push({ name, method: data.readUInt16LE(offset + 10), size: data.readUInt32LE(offset + 20), local: data.readUInt32LE(offset + 42) });
    offset += 46 + nameLength + data.readUInt16LE(offset + 30) + data.readUInt16LE(offset + 32);
  }
  if (!requestedEntry) console.log(JSON.stringify({ url, entries: entries.filter(entry => /\.svg$/i.test(entry.name)).map(entry => entry.name) }));
  else {
    const entry = entries.find(entry => entry.name === requestedEntry);
    if (!entry) throw new Error('ZIP entry not found.');
    const start = entry.local + 30 + data.readUInt16LE(entry.local + 26) + data.readUInt16LE(entry.local + 28);
    const compressed = data.subarray(start, start + entry.size);
    const contents = entry.method === 8 ? inflateRawSync(compressed) : compressed;
    console.log(JSON.stringify({ url, entry: entry.name, svg: contents.toString('utf8') }));
  }
} else {
  const content = data.toString('utf8');
  if (requestedEntry?.startsWith('@svg:')) {
    const svg = (content.match(/<svg[\s\S]*?<\/svg>/g) || [])[Number(requestedEntry.slice(5))];
    if (!svg) throw new Error('Inline SVG not found.');
    console.log(JSON.stringify({ url, entry: requestedEntry, svg }));
  } else if (data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    // Preserve original raster artwork byte-for-byte inside a portable SVG wrapper.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="data:image/png;base64,${data.toString('base64')}"/></svg>`;
    console.log(JSON.stringify({ url, svg }));
  } else if (content.includes('<svg') && !content.includes('<html')) console.log(JSON.stringify({ url, svg: content }));
  else console.log(JSON.stringify({ url, links: [...new Set(content.match(/(?:https?:\/\/|\/)[^\s\x22<>]*(?:logo|brand|monogram)[^\s\x22<>]*/gi) || [])].filter(link => link.length < 400).slice(0, 70) }));
}
