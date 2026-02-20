import { Check, BookOpen, Calculator, Brain, Beaker, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const SubjectsCarousel = () => {
  const { t } = useTranslation();

  const subjects = [
    { nameKey: "subjects.algebra", icon: Calculator, color: "bg-blue-500" },
    { nameKey: "subjects.geometry", icon: Beaker, color: "bg-purple-500" },
    { nameKey: "subjects.trigonometry", icon: Languages, color: "bg-pink-500" },
    { nameKey: "subjects.calculus", icon: BookOpen, color: "bg-green-500" },
    { nameKey: "subjects.probability", icon: Brain, color: "bg-cyan-500" },
  ];

  const features = [
    "subjects.features.downloadablePdf",
    "subjects.features.examPrep",
    "subjects.features.exercises",
  ];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {t("subjects.title")}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {features.map((featureKey, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{t(featureKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {subjects.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <div
                  key={`${subject.nameKey}-${index}`}
                  className="flex-shrink-0 w-full bg-white rounded-xl shadow-md px-4 py-3 flex items-center gap-3 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-10 h-10 ${subject.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-800 text-sm whitespace-nowrap">{t(subject.nameKey)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center text-gray-600 mt-8 font-medium">Et bien plus encore...</p>
      </div>
    </section>
  );
};

export default SubjectsCarousel;
