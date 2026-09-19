const fs = require('fs');
const content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('return "📖"') || line.includes("return '📖'") || line.includes('📖') || line.includes('🤲') || line.includes('💰') || line.includes('📢') || line.includes('📝')) {
    console.log((i+1) + ': ' + line.trim());
  }
});
