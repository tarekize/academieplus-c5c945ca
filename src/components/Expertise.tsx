import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { GraduationCap, Calendar, ShieldCheck } from "lucide-react";
import teachersTeamImage from "@/assets/teachers-team.jpg";
import { useTranslation } from "react-i18next";

const Expertise = () => {
  const { t } = useTranslation();
  
  const guarantees = [
    {
      icon: GraduationCap,
      title: t("expertise.certifiedExpertise.title"),
      description: t("expertise.certifiedExpertise.description"),
    },
    {
      icon: Calendar,
      title: t("expertise.experience.title"),
      description: t("expertise.experience.description"),
    },
    {
      icon: ShieldCheck,
      title: t("expertise.validatedContent.title"),
      description: t("expertise.validatedContent.description"),
    },
  ];

  return (
    <section id="expertise" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("expertise.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("expertise.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <div className="order-2 lg:order-1">
            <div className="prose prose-lg max-w-none">
              <p 
                className="text-muted-foreground leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: t("expertise.intro") }}
              />
              <p className="text-muted-foreground leading-relaxed">
                {t("expertise.content")}
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <img 
              src={teachersTeamImage} 
              alt="Équipe pédagogique professionnelle préparant des cours"
              className="w-full h-auto rounded-lg shadow-elegant"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {guarantees.map((guarantee, index) => {
            const Icon = guarantee.icon;
            return (
              <Card 
                key={index} 
                className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-card border-border"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {guarantee.title}
                </h3>
                <p className="text-muted-foreground">
                  {guarantee.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button size="lg" className="text-lg">
            {t("expertise.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Expertise;
