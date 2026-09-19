const fs = require('fs');
const file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace input classes
content = content.replace(/className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-2\.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"/g,
'className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-2.5 py-2 min-w-0 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"');

// Replace + Tambah button classes
content = content.replace(/className="bg-slate-50 text-black hover:bg-slate-100 border border-slate-200 px-3 py-2\.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"/g,
'className="bg-slate-50 text-black hover:bg-slate-100 border border-slate-200 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"');

// Replace Trash button classes
content = content.replace(/className="bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 p-2\.5 rounded-xl cursor-pointer shrink-0"/g,
'className="bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 p-2 rounded-xl cursor-pointer shrink-0"');

fs.writeFileSync(file, content);
console.log('Padding and widths adjusted for dynamic lists!');
