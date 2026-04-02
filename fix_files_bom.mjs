import fs from 'fs';
import { execSync } from 'child_process';
const files = [
  'index.html',
  'package.json',
  'src/App.css',
  'src/App.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/sonner.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/toaster.tsx',
  'src/hooks/use-toast.ts',
  'src/index.css',
  'src/pages/Index.tsx',
  'src/pages/NotFound.tsx',
  'src/main.tsx',
  'tsconfig.json',
  'vite.config.ts'
];
files.forEach(f => {
  try {
    const f_win = f.replace(/\//g, '\\');
    const contentBuffer = execSync('git show HEAD:' + f);
    let content = contentBuffer.toString('utf8');
    if (content.includes('<<<<<<< HEAD')) {
        content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>>[^\n]*\n/g, '$1');
    }
    fs.writeFileSync(f_win, content);
    console.log('Restored correctly', f);
  } catch (e) {
    console.log('Skipped', f, e.message);
  }
});
