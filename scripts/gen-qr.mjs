// Regenerates the <rect> markup embedded in frontend/src/components/QrTicket.tsx.
// Run if the production demo URL changes: node scripts/gen-qr.mjs <url>
// Requires the `qrcode` package (not a project dependency — install it
// ad hoc: npm install --no-save qrcode).
import QRCode from "qrcode";

const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/gen-qr.mjs <url>");
  process.exit(1);
}

const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
const { size, data } = qr.modules;
const rects = [];

for (let y = 0; y < size; y++) {
  let runStart = -1;
  for (let x = 0; x <= size; x++) {
    const on = x < size && data[y * size + x];
    if (on && runStart === -1) runStart = x;
    if (!on && runStart !== -1) {
      rects.push(`<rect x="${runStart}" y="${y}" width="${x - runStart}" height="1"/>`);
      runStart = -1;
    }
  }
}

console.log(`QR_SIZE = ${size}`);
console.log(`module count (merged rects) = ${rects.length}`);
console.log("");
console.log(rects.map((r) => `        ${r}`).join("\n"));
