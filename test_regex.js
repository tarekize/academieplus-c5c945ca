const s = 'إذن المستقيم $y = 2$ هو مقارب أفقي للمنحنى $\\mathcal{C}_f$ بجوار $+\\infty$.';
const res = s.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (match, prefix, mathContent) => {
    return `${prefix}<span class="math math-inline">${mathContent}</span>`;
});
console.log(res);
