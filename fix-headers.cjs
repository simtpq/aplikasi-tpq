const fs = require('fs');
const file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /bg-gradient-to-b from-\[\#062e2a\] via-\[\#0d5f57\] to-\[\#114b45\] text-white[^\"]+/g;
const newClass = 'bg-gradient-to-b from-[#062e2a] via-[#0d5f57] to-[#114b45] text-white pt-4 pb-8 px-5 relative rounded-b-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]';

const newContent = content.replace(regex, newClass);
fs.writeFileSync(file, newContent);
console.log('Headers unified!');
