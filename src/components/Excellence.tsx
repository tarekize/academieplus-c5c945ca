import { GraduationCap, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import teachersImage from "@/assets/teachers-team.jpg";
import { useTranslation } from "react-i18next";

const Excellence = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: GraduationCap,
      titleKey: "excellence.certifiedExpertise.title",
      descriptionKey: "excellence.certifiedExpertise.description",
      color: "bg-blue-500"
    },
    {
      icon: Calendar,
      titleKey: "excellence.experience.title",
      descriptionKey: "excellence.experience.description",
      color: "bg-blue-500"
    },
    {
      icon: Shield,
      titleKey: "excellence.validatedContent.title",
      descriptionKey: "excellence.validatedContent.description",
      color: "bg-blue-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("excellence.title")}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("excellence.subtitle")}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto mb-16">
          {/* Left side - Text */}
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("excellence.intro1") }} />
            <p className="text-gray-700 leading-relaxed">
              {t("excellence.intro2")}
            </p>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={teachersImage}
                alt="Équipe d'enseignants expérimentés"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t("excellence.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Excellence;
