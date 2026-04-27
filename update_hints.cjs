const fs = require('fs');

let file = 'src/components/course/LessonActivityTabs.tsx';
let txt = fs.readFileSync(file, 'utf8');

// For TrackedQuizCard, CompletedQuizCard... wait, others don't have it maybe?
// We need to make sure we only replace in components that need it. Wait, `showHint` is harmless to declare.
txt = txt.replace(
    /const \[answered, setAnswered\] = useState\(false\);\n\s*const \[submitting, setSubmitting\] = useState\(false\);/g,
    'const [answered, setAnswered] = useState(false);\n  const [submitting, setSubmitting] = useState(false);\n  const [showHint, setShowHint] = useState(false);'
);

txt = txt.replace(
    /const \[answer, setAnswer\] = useState\(""\);\n\s*const \[result, setResult\] = useState<boolean \| null>\(null\);/g,
    'const [answer, setAnswer] = useState("");\n  const [result, setResult] = useState<boolean | null>(null);\n  const [showHint, setShowHint] = useState(false);'
);

fs.writeFileSync(file, txt);
console.log('Update Complete 2');
