const fs = require('fs');

let file = 'LessonActivityTabs.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. imports
if (!txt.includes('import { HtmlWithMath } from "./HtmlWithMath";')) {
    txt = txt.replace(
        'import { useActivityTimeTracker } from "@/hooks/useActivityTimeTracker";',
        'import { useActivityTimeTracker } from "@/hooks/useActivityTimeTracker";\nimport { HtmlWithMath } from "./HtmlWithMath";'
    );
}

// 2. interfaces
if (!txt.includes('hint?: string | null;')) {
    txt = txt.replace(/difficulty\?: number;\n}/g, 'difficulty?: number;\n  hint?: string | null;\n}');
    txt = txt.replace(/explanation\?: string;\n}/g, 'explanation?: string;\n  hint?: string | null;\n}');
    txt = txt.replace(/expected_answer\?: string;\n}/g, 'expected_answer?: string;\n  hint?: string | null;\n}');
}

// 3. TrackedQuizCard - replace raw text with HtmlWithMath and inject hint
txt = txt.replace(
    'const [answered, setAnswered] = useState(false);\n    const [submitting, setSubmitting] = useState(false);',
    'const [answered, setAnswered] = useState(false);\n    const [submitting, setSubmitting] = useState(false);\n    const [showHint, setShowHint] = useState(false);'
);

txt = txt.replace(
    '<p className="font-medium flex-1" dir="rtl">{index + 1}. {question.question}</p>',
    '<div className="font-medium flex-1 flex gap-2 items-start" dir="rtl"><span className="shrink-0">{index + 1}.</span><HtmlWithMath htmlContent={question.question} className="flex-1 text-right" /></div>'
);

// We replace the difficulty block to inject the hint block underneath
txt = txt.replace(
    /<div className="flex justify-between items-start mb-3">([\s\S]*?)<DifficultyIndicator level=\{question\.difficulty\} \/>\n\s*<\/div>/g,
    function (match) {
        if (match.includes('showHint')) return match;
        return match + `
          {question.hint && (
            <div dir="rtl" className="mb-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowHint(v => !v)} className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950 mb-2">
                <Lightbulb className="h-4 w-4" />{showHint ? "إخفاء المساعدة" : "مساعدة"}
              </Button>
              {showHint && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    <HtmlWithMath htmlContent={question.hint} className="text-sm" />
                  </div>
                </div>
              )}
            </div>
          )}`;
    }
);

txt = txt.replace(
    /<span className="text-right flex-1">\{opt\}<\/span>/g,
    '<HtmlWithMath htmlContent={opt} className="text-right flex-1" />'
);

txt = txt.replace(
    /<div><span className="font-medium">الشرح: <\/span>\{explanation\}<\/div>/g,
    '<div className="flex gap-1 align-top"><span className="font-medium shrink-0">الشرح: </span><HtmlWithMath htmlContent={explanation} className="flex-1" /></div>'
);

txt = txt.replace(
    /<div><span className="font-medium">الشرح: <\/span>\{question\.explanation\}<\/div>/g,
    '<div className="flex gap-1 align-top"><span className="font-medium shrink-0">الشرح: </span><HtmlWithMath htmlContent={question.explanation} className="flex-1" /></div>'
);

// 4. TrackedExerciseCard and CompletedExerciseCard adjustments
txt = txt.replace(
    'const [answer, setAnswer] = useState("");\n    const [result, setResult] = useState<boolean | null>(null);',
    'const [answer, setAnswer] = useState("");\n    const [result, setResult] = useState<boolean | null>(null);\n    const [showHint, setShowHint] = useState(false);'
);

txt = txt.replace(
    /<p className="text-sm text-right" dir="rtl">\{exercise\.statement\}<\/p>/g,
    `{exercise.statement.includes('<') || exercise.statement.includes('$') || exercise.statement.includes(' \\\\') ? (
            <HtmlWithMath htmlContent={exercise.statement} className="text-sm border-t pt-2" />
          ) : (
            <p className="text-sm border-t pt-2 text-right" dir="rtl">{exercise.statement}</p>
          )}
          {exercise.hint && (
            <div dir="rtl" className="mt-2 mb-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowHint(v => !v)} className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950 mb-2">
                <Lightbulb className="h-4 w-4" />{showHint ? "إخفاء المساعدة" : "مساعدة"}
              </Button>
              {showHint && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    <HtmlWithMath htmlContent={exercise.hint} className="text-sm flex-1" />
                  </div>
                </div>
              )}
            </div>
          )}`
);

txt = txt.replace(
    /<p className="text-sm" dir="rtl">\{exercise\.statement\}<\/p>/g,
    '<HtmlWithMath htmlContent={exercise.statement} className="text-sm mt-3 mb-2 block" />'
);

txt = txt.replace(
    /\{solution && <div><span className="font-medium">الحل المنطقي: <\/span>\{solution\}<\/div>\}/g,
    `{solution && (
                <div className="flex flex-col gap-1 border-t pt-2 mt-2 text-right" dir="rtl">
                  <span className="font-medium text-purple-700 dark:text-purple-400">الحل المفصل 🎯</span>
                  <HtmlWithMath htmlContent={solution} className="bg-white dark:bg-black/20 p-3 rounded-md border border-purple-100 dark:border-purple-900/30 text-right" />
                </div>
              )}`
);

txt = txt.replace(
    /\{exercise\.solution && <div><span className="font-medium">الحل: <\/span>\{exercise\.solution\}<\/div>\}/g,
    `{exercise.solution && (
                <div className="flex flex-col gap-1 border-t pt-2 mt-2 text-right" dir="rtl">
                  <span className="font-medium text-purple-700 dark:text-purple-400">الحل المفصل 🎯</span>
                  <HtmlWithMath htmlContent={exercise.solution} className="bg-white dark:bg-black/20 p-3 rounded-md border border-purple-100 dark:border-purple-900/30 text-right" />
                </div>
              )}`
);

txt = txt.replace(
    /\{solution && <div><span className="font-medium">الحل: <\/span>\{solution\}<\/div>\}/g,
    `{solution && (
                <div className="flex flex-col gap-1 border-t pt-2 mt-2 text-right" dir="rtl">
                  <span className="font-medium text-purple-700 dark:text-purple-400">الحل المفصل 🎯</span>
                  <HtmlWithMath htmlContent={solution} className="bg-white dark:bg-black/20 p-3 rounded-md border border-purple-100 dark:border-purple-900/30 text-right" />
                </div>
              )}`
);

fs.writeFileSync(file, txt);
console.log('Update Complete');
