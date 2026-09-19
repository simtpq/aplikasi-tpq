const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'AdminDashboard.tsx');
const fullContent = fs.readFileSync(filePath, 'utf8');

const importStr = "import React, { useState, useEffect } from 'react';";
const firstIndex = fullContent.indexOf(importStr);
const secondIndex = fullContent.indexOf(importStr, firstIndex + 1);
const thirdIndex = fullContent.indexOf(importStr, secondIndex + 1);

if (thirdIndex !== -1) {
  // The original file is from the third occurrence onwards
  const originalContent = fullContent.substring(thirdIndex);
  fs.writeFileSync(filePath, originalContent, 'utf8');
  console.log('File successfully restored from corruption!');
} else {
  console.log('Could not find three occurrences, perhaps it was corrupted differently.');
}
