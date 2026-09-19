const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const qIndex = content.indexOf('              {/* QUICK ACTIONS SECTION */}');
const pIndex = content.indexOf('              {/* PENGUMUMAN PENTING SECTION */}');
const kIndex = content.indexOf('              {/* FULL-WIDTH DETAILED KAS CARD */}');

const strQStart = content.lastIndexOf('              {/* SEPARATOR */}', qIndex);
const strPStart = content.lastIndexOf('              {/* SEPARATOR */}', pIndex);
const strKStart = content.lastIndexOf('              {/* SEPARATOR */}', kIndex);

const afterK = content.indexOf('              {/* SEPARATOR */}', kIndex);

console.log('strQStart:', strQStart);
console.log('strPStart:', strPStart);
console.log('strKStart:', strKStart);
console.log('afterK:', afterK);

if (strQStart !== -1 && strPStart !== -1 && strKStart !== -1 && afterK !== -1) {
  // Current blocks: Q, P, K based on the indices
  // The current order is Q, P, K. Wait, my previous output was Kas: 208799, Quick Actions: 200981, Pengumuman: 204507.
  // Actually, the previous output from my check script was:
  // Quick Actions: 200981 (Q)
  // Pengumuman: 204507 (P)
  // Kas: 208799 (K)
  // Which matches Q -> P -> K!
  
  const blockQ = content.substring(strQStart, strPStart);
  const blockP = content.substring(strPStart, strKStart);
  const blockK = content.substring(strKStart, afterK);
  
  const beforeAll = content.substring(0, strQStart);
  const afterAll = content.substring(afterK);
  
  // New order: K -> Q -> P
  const newContent = beforeAll + blockK + '\n' + blockQ + '\n' + blockP + '\n' + afterAll;
  
  fs.writeFileSync('src/components/AdminDashboard.tsx', newContent);
  console.log('Successfully reordered K -> Q -> P');
} else {
  console.log('Failed to find markers.');
}
