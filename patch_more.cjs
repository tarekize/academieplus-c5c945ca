const fs = require('fs');

function replaceAll(file) {
    if (!fs.existsSync(file)) return;
    let txt = fs.readFileSync(file, 'utf8');

    if (!txt.includes('import { HtmlWithMath } from "./HtmlWithMath";')) {
        txt = 'import { HtmlWithMath } from "./HtmlWithMath";\n' + txt;
    }

    // ChapterMathExercises
    txt = txt.replace(
        /<div className="prose prose-sm dark:prose-invert max-w-none">\s*<ReactMarkdown>\{exercise\.statement\}<\/ReactMarkdown>\s*<\/div>/g,
        '<HtmlWithMath htmlContent={exercise.statement} className="text-sm border-t pt-2 block" />'
    );

    txt = txt.replace(
        /<div className="prose prose-sm dark:prose-invert max-w-none flex-1">\s*<ReactMarkdown>\{exercise\.hint\}<\/ReactMarkdown>\s*<\/div>/g,
        '<HtmlWithMath htmlContent={exercise.hint} className="text-sm flex-1 max-w-none text-right" />'
    );

    // MathExercises
    txt = txt.replace(
        /<ReactMarkdown>([^<]*)<\/ReactMarkdown>/g,
        '<HtmlWithMath htmlContent={$1} className="prose prose-sm dark:prose-invert max-w-none text-right" />'
    );

    fs.writeFileSync(file, txt);
    console.log(file, 'patched');
}

replaceAll('src/components/course/ChapterMathExercises.tsx');
replaceAll('src/components/course/MathExercises.tsx');
