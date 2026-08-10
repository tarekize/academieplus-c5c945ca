import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

type BlockKind = "block-definition" | "block-property" | "block-remark" | "block-example" | "block-graphic";

interface TocItem {
    id: string;
    text: string;
    level: number;
    /** Absent pour un titre (h1/h2/h3) ; renseigné pour un bloc pédagogique
     * (définition/propriété/remarque/exemple/schéma), affiché indenté sous
     * le dernier titre rencontré. */
    blockKind?: BlockKind;
}

const BLOCK_KIND_LABEL: Record<BlockKind, { ar: string; fr: string; color: string }> = {
    "block-definition": { ar: "تعريف", fr: "Définition", color: "217 91% 60%" },
    "block-property": { ar: "خاصية", fr: "Propriété", color: "160 84% 39%" },
    "block-remark": { ar: "ملاحظة", fr: "Remarque", color: "38 92% 50%" },
    "block-example": { ar: "مثال", fr: "Exemple", color: "280 70% 55%" },
    "block-graphic": { ar: "شكل", fr: "Schéma", color: "340 75% 55%" },
};

function detectBlockKind(el: Element): BlockKind | null {
    for (const kind of Object.keys(BLOCK_KIND_LABEL) as BlockKind[]) {
        if (el.classList.contains(kind)) return kind;
    }
    return null;
}

interface TableOfContentsProps {
    htmlContent: string;
    className?: string;
    title?: string;
    dir?: "rtl" | "ltr";
    compact?: boolean;
}

const SUPERSCRIPT_MAP: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
    "=": "⁼",
    "(": "⁽",
    ")": "⁾",
    "n": "ⁿ",
    "i": "ⁱ",
    "/": "⁄"
};

function toSuperscript(value: string): string {
    return value
        .split("")
        .map((ch) => SUPERSCRIPT_MAP[ch] || ch)
        .join("");
}

function latexToSymbols(input: string): string {
    let out = input;

    // Normalize duplicated escapes (e.g. "\\mathcal") to a single backslash.
    out = out.replace(/\\{2,}/g, "\\");

    out = out.replace(/\$/g, "");
    out = out.replace(/\\+mathcal\s*\{([^}]+)\}/g, "$1");
    out = out.replace(/\\+mathbb\s*\{([^}]+)\}/g, "$1");
    out = out.replace(/\\+text\s*\{([^}]+)\}/g, "$1");

    out = out.replace(/\\+d?frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, "$1/$2");

    out = out.replace(/\\+mapsto/g, "↦");
    out = out.replace(/\\+to/g, "→");
    out = out.replace(/\\+neq/g, "≠");
    out = out.replace(/\\+geq?/g, "≥");
    out = out.replace(/\\+leq?/g, "≤");
    out = out.replace(/\\+infty/g, "∞");
    out = out.replace(/\\+mu/g, "μ");
    out = out.replace(/\\+sigma/g, "σ");
    out = out.replace(/\\+alpha/g, "α");
    out = out.replace(/\\+beta/g, "β");
    out = out.replace(/\\+gamma/g, "γ");
    out = out.replace(/\\+pi/g, "π");

    out = out.replace(/\\+sqrt\s*\[([^\]]+)\]\s*\{([^}]+)\}/g, (_m, n, expr) => `${toSuperscript(String(n).trim())}√${String(expr).trim()}`);
    out = out.replace(/\\+sqrt\s*\{([^}]+)\}/g, (_m, expr) => `√${String(expr).trim()}`);

    out = out.replace(/\^\{([^}]+)\}/g, (_m, exp) => toSuperscript(String(exp).trim()));
    out = out.replace(/\^([A-Za-z0-9+\-=()])/g, (_m, exp) => toSuperscript(String(exp)));

    out = out.replace(/_\{([^}]+)\}/g, (_m, sub) => `(${String(sub).trim()})`);
    out = out.replace(/[{}]/g, "");
    out = out.replace(/\\,/g, " ");
    out = out.replace(/\\/g, "");

    return out.replace(/\s+/g, " ").trim();
}

export function TableOfContents({ htmlContent, className, title, dir, compact = false }: TableOfContentsProps) {
    const { t, i18n } = useTranslation();
    const resolvedDir: "rtl" | "ltr" = dir ?? (i18n.language?.startsWith("ar") ? "rtl" : "ltr");
    const [items, setItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    const wrapperClassName = compact
        ? "h-full bg-transparent border-0 shadow-none p-0"
        : "bg-card/50 backdrop-blur-sm border rounded-xl p-5 sticky top-24 max-h-[80vh] overflow-y-auto shadow-sm transition-all animate-in fade-in slide-in-from-right-2";

    useEffect(() => {
        if (!htmlContent) {
            setItems([]);
            return;
        }

        // Delay slightly to allow ReactMarkdown to render the content in the DOM
        const timer = setTimeout(() => {
            const container = document.querySelector('.lesson-markdown');
            if (!container) return;

            const elements = container.querySelectorAll("h1, h2, h3, .lesson-block");

            // Utility to extract text cleanly without duplicating KaTeX elements
            const extractText = (htmlNode: Element): string => {
                const clone = htmlNode.cloneNode(true) as Element;

                clone.querySelectorAll('.katex').forEach((el) => {
                    const annotation = el.querySelector('annotation');
                    if (annotation) {
                        let tex = annotation.textContent || "";
                        // Handle common LaTeX formatting in TOC
                        tex = tex.replace(/\\d?frac{([^}]+)}{([^}]+)}/g, '$1/$2');
                        tex = tex.replace(/\\infty/g, '∞');
                        tex = tex.replace(/\$/g, '');
                        const textNode = document.createTextNode(` ${tex.trim()} `);
                        if (el.parentNode) {
                            el.parentNode.replaceChild(textNode, el);
                        }
                    } else {
                        // Fallback if no annotation
                        const htmlEl = el.querySelector('.katex-html');
                        if (htmlEl) htmlEl.remove();
                    }
                });

                return latexToSymbols((clone.textContent || "").replace(/\s+/g, " ").trim());
            };

            // Un bloc pédagogique (définition/propriété/remarque/exemple/schéma)
            // s'indente sous le dernier titre rencontré en parcourant le DOM
            // dans l'ordre, plutôt que de prendre son "niveau" sur sa propre
            // balise (ce sont toujours des <div>, sans notion de niveau).
            let currentHeadingLevel = 1;
            const tocItems: TocItem[] = Array.from(elements).map((el, index) => {
                const blockKind = detectBlockKind(el);
                const id = el.id || `toc-${index}-${Math.random().toString(36).substr(2, 9)}`;
                if (!el.id) el.id = id;

                if (!blockKind) {
                    currentHeadingLevel = parseInt(el.tagName.substring(1));
                    return { id, text: extractText(el) || "", level: currentHeadingLevel };
                }

                const titleEl = el.querySelector(".lesson-block-title");
                const label = BLOCK_KIND_LABEL[blockKind][resolvedDir === "rtl" ? "ar" : "fr"];
                const text = titleEl ? extractText(titleEl) : label;
                return { id, text: text || label, level: currentHeadingLevel + 1, blockKind };
            });

            setItems(tocItems);
        }, 150);

        return () => clearTimeout(timer);
    }, [htmlContent, resolvedDir]);

    // Scroll spy: highlight the heading the student is currently reading
    useEffect(() => {
        if (items.length === 0) return;

        let frame = 0;

        const computeActive = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const elements = items
                    .map((item) => document.getElementById(item.id))
                    .filter((el): el is HTMLElement => Boolean(el));

                if (elements.length === 0) return;

                const offset = 140; // account for sticky header
                let currentId = elements[0].id;
                for (const el of elements) {
                    if (el.getBoundingClientRect().top - offset <= 0) {
                        currentId = el.id;
                    } else {
                        break;
                    }
                }
                setActiveId(currentId);
            });
        };

        computeActive();
        // Use capture phase so we also catch scrolling that happens inside
        // an inner scroll container (scroll events don't bubble).
        window.addEventListener("scroll", computeActive, { passive: true, capture: true });
        window.addEventListener("resize", computeActive);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", computeActive, { capture: true } as EventListenerOptions);
            window.removeEventListener("resize", computeActive);
        };
    }, [items]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Offset for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className={cn(
            wrapperClassName,
            className
        )}>
            <div className={cn("flex items-center gap-2 mb-4 border-b pb-3", resolvedDir === "rtl" ? "flex-row-reverse" : "")}>
                <List className="h-4 w-4 text-primary" />
                <h3 className={cn("font-bold text-sm uppercase tracking-widest text-primary", compact && "text-base")}>
                    {title || t("tableOfContents.title")}
                </h3>
            </div>

            {items.length > 0 ? (
                <nav className="space-y-2">
                    {items.map((item) => {
                        const isActive = activeId === item.id;
                        const blockColor = item.blockKind ? BLOCK_KIND_LABEL[item.blockKind].color : null;
                        return (
                            <button
                                key={item.id}
                                onClick={() => scrollToHeading(item.id)}
                                dir={resolvedDir}
                                aria-current={isActive ? "true" : undefined}
                                style={blockColor ? { borderInlineStartColor: `hsl(${blockColor})` } : undefined}
                                className={cn(
                                    "flex items-start gap-1.5 w-full text-sm transition-all hover:translate-x-1 hover:text-primary active:scale-95 px-2 py-1.5 rounded-md",
                                    resolvedDir === "rtl" ? "text-right" : "text-left",
                                    !item.blockKind && item.level === 1 && "font-bold border-l-2 border-primary/20 pl-2",
                                    !item.blockKind && item.level === 2 && "font-medium opacity-90 pl-4",
                                    !item.blockKind && item.level === 3 && "text-xs opacity-75 pl-7 text-muted-foreground",
                                    item.blockKind && "text-xs opacity-80 text-muted-foreground border-l-2",
                                    item.blockKind && item.level <= 2 && "pl-4",
                                    item.blockKind && item.level === 3 && "pl-7",
                                    item.blockKind && item.level >= 4 && "pl-10",
                                    isActive && "!text-primary !font-extrabold !opacity-100 bg-primary/15 underline underline-offset-4 decoration-2 shadow-sm"
                                )}
                            >
                                {blockColor && (
                                    <span
                                        className="inline-block h-1.5 w-1.5 rounded-full shrink-0 mt-1.5"
                                        style={{ backgroundColor: `hsl(${blockColor})` }}
                                    />
                                )}
                                <span className="min-w-0 break-words">{item.text}</span>
                            </button>
                        );
                    })}
                </nav>
            ) : (
                <p className={cn("text-xs text-muted-foreground italic leading-relaxed", resolvedDir === "rtl" ? "text-right" : "text-left")}>
                    {t("tableOfContents.emptyState")}
                </p>
            )}
        </div>
    );
}
