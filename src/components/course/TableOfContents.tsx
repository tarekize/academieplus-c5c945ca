import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    htmlContent: string;
    className?: string;
    title?: string;
    dir?: "rtl" | "ltr";
}

export function TableOfContents({ htmlContent, className, title = "Table des matières", dir = "rtl" }: TableOfContentsProps) {
    const [items, setItems] = useState<TocItem[]>([]);

    useEffect(() => {
        if (!htmlContent) {
            setItems([]);
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const headings = doc.querySelectorAll("h1, h2, h3");

        const tocItems: TocItem[] = Array.from(headings).map((heading, index) => {
            const text = heading.textContent || "";
            const id = heading.id || `toc-${index}-${text.toLowerCase().replace(/[^\w]/g, "-")}`;
            return {
                id,
                text,
                level: parseInt(heading.tagName.substring(1)),
            };
        });

        setItems(tocItems);
    }, [htmlContent]);

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
            "bg-card/50 backdrop-blur-sm border rounded-xl p-5 sticky top-24 max-h-[80vh] overflow-y-auto shadow-sm transition-all animate-in fade-in slide-in-from-right-2",
            className
        )}>
            <div className={cn("flex items-center gap-2 mb-4 border-b pb-3", dir === "rtl" ? "flex-row-reverse" : "")}>
                <List className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-primary">
                    {dir === "rtl" ? "فهرس المحتويات" : title}
                </h3>
            </div>

            {items.length > 0 ? (
                <nav className="space-y-2">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToHeading(item.id)}
                            dir={dir}
                            className={cn(
                                "block w-full text-sm transition-all hover:translate-x-1 hover:text-primary active:scale-95",
                                dir === "rtl" ? "text-right" : "text-left",
                                item.level === 1 && "font-bold border-l-2 border-primary/20 pl-2",
                                item.level === 2 && "font-medium opacity-90 pl-4",
                                item.level === 3 && "text-xs opacity-75 pl-7 text-muted-foreground"
                            )}
                        >
                            {item.text}
                        </button>
                    ))}
                </nav>
            ) : (
                <p className={cn("text-xs text-muted-foreground italic leading-relaxed", dir === "rtl" ? "text-right" : "text-left")}>
                    {dir === "rtl"
                        ? "Ø³ÙŠØ¸Ù‡Ø± ÙÙ‡Ø±Ø³ الدروس Ù‡Ù†Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¹Ù†Ø¯ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø¹Ù†Ø§ÙˆÙŠÙ† Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„Ù…Ø­ØªÙˆÙ‰."
                        : "Le plan du cours s'affichera ici automatiquement après l'ajout de titres."}
                </p>
            )}
        </div>
    );
}
