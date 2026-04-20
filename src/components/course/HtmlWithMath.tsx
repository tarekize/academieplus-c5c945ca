import React, { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.js";
import "katex/dist/katex.min.css";

interface HtmlWithMathProps extends React.HTMLAttributes<HTMLDivElement> {
    htmlContent: string;
}

export const HtmlWithMath: React.FC<HtmlWithMathProps> = ({ htmlContent, ...props }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                        { left: "\\(", right: "\\)", display: false },
                        { left: "\\[", right: "\\]", display: true }
                    ],
                    throwOnError: false,
                });
            } catch (e) {
                console.error("Error rendering math", e);
            }
        }
    }, [htmlContent]);

    return (
        <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            {...props}
        />
    );
};
