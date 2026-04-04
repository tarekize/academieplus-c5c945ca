import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t("faq.questions.howItWorks.question"),
      answer: t("faq.questions.howItWorks.answer"),
    },
    {
      question: t("faq.questions.subjects.question"),
      answer: t("faq.questions.subjects.answer"),
    },
    {
      question: t("faq.questions.freeTrial.question"),
      answer: t("faq.questions.freeTrial.answer"),
    },
    {
      question: t("faq.questions.tracking.question"),
      answer: t("faq.questions.tracking.answer"),
    },
    {
      question: t("faq.questions.support.question"),
      answer: t("faq.questions.support.answer"),
    },
    {
      question: t("faq.questions.algerian.question"),
      answer: t("faq.questions.algerian.answer"),
    },
    {
      question: t("faq.questions.changePlan.question"),
      answer: t("faq.questions.changePlan.answer"),
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6 bg-gray-50"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
