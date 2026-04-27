const fs = require('fs');

let file = 'src/components/course/ChapterMathExercises.tsx';
let txt = fs.readFileSync(file, 'utf8');

if (!txt.includes('import { HtmlWithMath } from "./HtmlWithMath";')) {
    txt = txt.replace(
        'import ReactMarkdown from "react-markdown";',
        'import ReactMarkdown from "react-markdown";\nimport { HtmlWithMath } from "./HtmlWithMath";'
    );
}

txt = txt.replace(
    /<div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>\{solution\}<\/ReactMarkdown><\/div>/g,
    '<HtmlWithMath htmlContent={solution} className="bg-white dark:bg-black/20 p-3 rounded-md border border-purple-100 dark:border-purple-900/30 text-right prose max-w-none" />'
);

txt = txt.replace(
    /\{showHint\[exercise\.id\] && \(\n\s*<div className="p-3 rounded-lg bg-amber-500\/10 border border-amber-500\/30">\n\s*<div className="flex items-start gap-2">\n\s*<Lightbulb className="h-4 w-4 text-amber-500 mt-1 shrink-0" \/>\n\s*<div className="prose prose-sm dark:prose-invert max-w-none text-right">\{exercise\.hint\}<\/div>/g,
    `{showHint[exercise.id] && (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                              <HtmlWithMath htmlContent={exercise.hint} className="text-sm flex-1 max-w-none text-right" />`
);

txt = txt.replace(
    /<div className="prose prose-sm dark:prose-invert max-w-none text-right">\{exercise\.hint\}<\/div>/g,
    '<HtmlWithMath htmlContent={exercise.hint} className="text-sm flex-1 max-w-none text-right" />'
);


fs.writeFileSync(file, txt);
console.log('ChapterMathExercises patched');
