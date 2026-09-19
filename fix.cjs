const fs = require('fs');

try {
  let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

  // 1. Re-apply text color fixes
  const classesToReplace = ['text-slate-400', 'text-slate-500', 'text-slate-600', 'text-gray-400', 'text-gray-500'];
  classesToReplace.forEach(cls => {
    content = content.split(cls).join('text-black font-medium');
  });

  // 2. Hide local navbars by changing their wrapper to 'hidden'
  content = content.split('className="sticky top-0 z-40 bg-transparent mb-4"').join('className="hidden"');
  content = content.split('className="sticky top-0 z-40 mb-4"').join('className="hidden"');
  content = content.split('className="sticky top-0 z-40 bg-transparent"').join('className="hidden"');

  fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf-8');
  console.log('Fixed successfully!');
} catch (e) {
  console.error(e);
}
