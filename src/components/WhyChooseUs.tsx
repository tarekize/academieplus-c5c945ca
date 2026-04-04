import { User, Brain, TrendingUp, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import studentsImage from "@/assets/student-tutoring-teen.jpg";

const WhyChooseUs = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: User,
      titleKey: "whyChooseUs.personalizedSupport.title",
      descriptionKey: "whyChooseUs.personalizedSupport.description",
      color: "bg-blue-500"
    },
    {
      icon: Brain,
      titleKey: "whyChooseUs.aiPedagogy.title",
      descriptionKey: "whyChooseUs.aiPedagogy.description",
      color: "bg-orange-500"
    },
    {
      icon: TrendingUp,
      titleKey: "whyChooseUs.rapidProgress.title",
      descriptionKey: "whyChooseUs.rapidProgress.description",
      color: "bg-blue-500"
    },
    {
      icon: GraduationCap,
      titleKey: "whyChooseUs.certifiedTeachers.title",
      descriptionKey: "whyChooseUs.certifiedTeachers.description",
      color: "bg-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("whyChooseUs.title")}
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            {t("whyChooseUs.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left side - Features */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{t(feature.titleKey)}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right side - Image */}
          <div className="relative h-full">
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-full">
              <img
                src={studentsImage}
                alt="Étudiants travaillant ensemble"
                className="w-full h-full object-cover min-h-[500px]"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
