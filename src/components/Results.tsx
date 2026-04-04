import { Card } from "./ui/card";
import studentsSuccessImage from "@/assets/students-success.jpg";
import studentOnlineImage from "@/assets/student-online.jpg";
import { useTranslation } from "react-i18next";

const Results = () => {
  const { t } = useTranslation();
  
  const stats = [
    {
      value: t("results.successRate.value"),
      label: t("results.successRate.label"),
      description: t("results.successRate.description"),
    },
    {
      value: t("results.averageGain.value"),
      label: t("results.averageGain.label"),
      description: t("results.averageGain.description"),
    },
    {
      value: t("results.studentsHelped.value"),
      label: t("results.studentsHelped.label"),
      description: t("results.studentsHelped.description"),
    },
    {
      value: t("results.satisfaction.value"),
      label: t("results.satisfaction.label"),
      description: t("results.satisfaction.description"),
    },
  ];

  return (
    <section id="resultats" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("results.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("results.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-card"
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="overflow-hidden bg-card">
            <img 
              src={studentsSuccessImage} 
              alt="Élèves célébrant leur réussite"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {t("results.confidence.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("results.confidence.description")}
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden bg-card">
            <img 
              src={studentOnlineImage} 
              alt="Élève suivant un cours en ligne"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {t("results.flexibility.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("results.flexibility.description")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Results;
