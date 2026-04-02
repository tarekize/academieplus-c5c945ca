const fs = require('fs');
const files = [
  'src/components/ui/calendar.tsx',
  'src/components/ui/sonner.tsx',
  'src/components/ui/toaster.tsx',
  'src/hooks/use-toast.ts',
  'src/pages/Index.tsx',
  'src/pages/NotFound.tsx'
];
for(let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n([\s\S]*?)  fs.writeFileSync(file, newContent);
}
