import { BookOpen, Users, TrendingUp, Award } from "lucide-react";
import { Card } from "./ui/card";
import studentTutoringImage from "@/assets/student-tutoring-teen.jpg";
import { useTranslation } from "react-i18next";

const Benefits = () => {
  const { t } = useTranslation();
  
  const benefits = [
    {
      icon: Users,
      title: t("benefits.personalizedSupport.title"),
      description: t("benefits.personalizedSupport.description"),
    },
    {
      icon: BookOpen,
      title: t("benefits.innovativePedagogy.title"),
      description: t("benefits.innovativePedagogy.description"),
    },
    {
      icon: TrendingUp,
      title: t("benefits.rapidProgress.title"),
      description: t("benefits.rapidProgress.description"),
    },
    {
      icon: Award,
      title: t("benefits.certifiedTeachers.title"),
      description: t("benefits.certifiedTeachers.description"),
    },
  ];

  return (
    <section id="avantages" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("benefits.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("benefits.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={studentTutoringImage} 
              alt="Élève lycéen(ne) de 16 ans avec son tuteur dans un environnement d'apprentissage moderne"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
