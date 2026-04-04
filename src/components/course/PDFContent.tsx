interface PDFContentProps {
  chapterTitle: string;
  content: string;
}

export const PDFContent = ({ chapterTitle, content }: PDFContentProps) => {
  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto">
      {/* En-tête du document */}
      <div className="mb-8 pb-4 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold text-center mb-2">{chapterTitle}</h1>
      </div>

      {/* Contenu formaté pour PDF */}
      <div 
        className="prose prose-slate max-w-none
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-black
          [&_h2]:page-break-after-avoid [&_h2]:break-after-avoid
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-black
          [&_h3]:bg-gray-100 [&_h3]:px-4 [&_h3]:py-2 [&_h3]:rounded
          [&_p]:text-base [&_p]:mb-4 [&_p]:leading-7 [&_p]:text-black
          [&_p]:page-break-inside-avoid [&_p]:break-inside-avoid
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2
          [&_li]:text-base [&_li]:leading-7 [&_li]:text-black
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2
          [&_blockquote]:bg-gray-50 [&_blockquote]:border-l-4 
          [&_blockquote]:border-gray-800 [&_blockquote]:p-4 
          [&_blockquote]:my-4 [&_blockquote]:italic
          [&_blockquote]:page-break-inside-avoid [&_blockquote]:break-inside-avoid
          [&_blockquote_p]:mb-0 [&_blockquote_p]:text-black
          [&_strong]:font-bold [&_strong]:text-black
          [&_em]:italic [&_em]:text-black"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
