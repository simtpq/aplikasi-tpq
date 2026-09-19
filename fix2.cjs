const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const strQStart = content.indexOf('              {/* SEPARATOR */}\n              <div className="flex justify-center mt-4 mb-0 opacity-20">');
const strPStart = content.indexOf('              {/* PENGUMUMAN PENTING SECTION */}');
const strPSepStart = content.lastIndexOf('              {/* SEPARATOR */}', strPStart);
const strKStart = content.indexOf('              {/* FULL-WIDTH DETAILED KAS CARD */}');
const strKSepStart = content.lastIndexOf('              {/* SEPARATOR */}', strKStart);
const afterK = content.indexOf('              {/* SEPARATOR */}', strKStart);

console.log('QStart:', strQStart);
console.log('PSepStart:', strPSepStart);
console.log('KSepStart:', strKSepStart);
console.log('afterK:', afterK);

if (strQStart !== -1 && strPStart !== -1 && strKStart !== -1 && afterK !== -1) {
  const blockQ = content.substring(strQStart, strPSepStart);
  const blockP = content.substring(strPSepStart, strKSepStart);
  const blockK = content.substring(strKSepStart, afterK);
  
  const beforeAll = content.substring(0, strQStart);
  const afterAll = content.substring(afterK);
  
  const newContent = beforeAll + blockK + '\n' + blockQ + '\n' + blockP + '\n' + afterAll;
  
  fs.writeFileSync('src/components/AdminDashboard.tsx', newContent);
  console.log('Successfully reordered K -> Q -> P');
} else {
  console.log('Failed to find markers.');
}
