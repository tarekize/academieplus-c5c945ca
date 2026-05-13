DELETE FROM public.ai_lesson_comments
WHERE message ILIKE '%راجع الدرس ثم اضغط%'
   OR message ILIKE '%راجع الأمثلة المحلولة في الدرس ثم اضغط%'
   OR message ILIKE '%تم تحليل عملك%واصل التدريب%'
   OR message ILIKE '%للحصول على 5 تمارين أو أسئلة مناسبة لمستواك%'
   OR (
     message NOT ILIKE '%مثال%'
     AND message NOT ILIKE '%الحل%'
     AND message NOT ILIKE '%الجواب%'
   );