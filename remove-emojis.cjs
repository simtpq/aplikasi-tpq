const fs = require('fs');
const file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace specific emojis + space
const emojis = ['📖 ', '🤲 ', '💰 ', '📝 ', '📢 ', '📣 ', '💸 ', '🗓️ '];
emojis.forEach(emoji => {
    content = content.split(emoji).join('');
});

// Also without trailing space just in case
const emojisNoSpace = ['📖', '🤲', '💰', '📝', '📢', '📣', '💸', '🗓️'];
emojisNoSpace.forEach(emoji => {
    content = content.split(emoji).join('');
});

fs.writeFileSync(file, content);
console.log('Emojis removed!');
