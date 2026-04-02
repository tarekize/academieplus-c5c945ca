import fs from 'fs';
const files = ['src/components/ui/calendar.tsx', 'src/components/ui/sonner.tsx', 'src/components/ui/toaster.tsx', 'src/hooks/use-toast.ts', 'src/pages/Index.tsx', 'src/pages/NotFound.tsx'];
for(let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n/g, '').replace(/>>>>>>>[^\n]*\n/g, '');
  fs.writeFileSync(file, content);
}
