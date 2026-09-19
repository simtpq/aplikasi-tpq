const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
const lines = code.split('\n');
const riwayatIdx = lines.findIndex(l => l.includes("activeTab === 'riwayat'"));
if(riwayatIdx !== -1) {
  const extracted = lines.slice(riwayatIdx, riwayatIdx + 300).join('\n');
  fs.writeFileSync('riwayat_temp.txt', extracted);
  console.log('done');
} else {
  console.log('not found');
}
