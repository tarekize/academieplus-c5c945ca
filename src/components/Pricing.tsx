import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PricingPlan {
  id: string;
  name: string;
  billing_period: 'monthly' | 'annual';
  total_single: number;
  total_family: number;
}

// Fallback plans
const FALLBACK_PLANS: PricingPlan[] = [
  { id: 'annual', name: 'Formule Scolaire', billing_period: 'annual', total_single: 15000, total_family: 25000 },
  { id: 'monthly', name: 'Formule Mensuelle', billing_period: 'monthly', total_single: 2000, total_family: 3500 },
];

const Pricing = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFamily, setIsFamily] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PLANS);
  const [periodLabel, setPeriodLabel] = useState("1 année scolaire");

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from("subscription_config").select("*").eq("is_active", true);
      if (data && data.length > 0) {
        setPlans(data.map((c: any) => ({
          id: c.plan_type,
          name: c.label,
          billing_period: c.plan_type as 'monthly' | 'annual',
          total_single: c.price_single,
          total_family: c.price_family,
        })));
      }
      const { data: periods } = await supabase.from("subscription_periods").select("*").eq("is_active", true).limit(1);
      if (periods && periods.length > 0) {
        setPeriodLabel(periods[0].label);
      }
    };
    fetchConfig();
  }, []);

  const getTotalPrice = (plan: PricingPlan) => {
    return isFamily ? plan.total_family : plan.total_single;
  };

  const annualPlan = plans.find(p => p.billing_period === 'annual');
  const monthlyPlan = plans.find(p => p.billing_period === 'monthly');

  const features = [
    "Tous les cours de mathématiques de votre niveau",
    "Exercices et corrigés",
    "Vidéos explicatives",
    "Suivi de progression",
    "Support prioritaire",
    "Examens blancs",
  ];

  const displayPlans = [
    {
      name: annualPlan?.name || "Formule Scolaire",
      price: annualPlan ? `${getTotalPrice(annualPlan).toLocaleString('fr-FR')} DA` : '---',
      description: `Paiement unique pour ${periodLabel}`,
      features,
      highlighted: true,
      planData: annualPlan,
    },
    {
      name: monthlyPlan?.name || "Formule Mensuelle",
      price: monthlyPlan ? `${getTotalPrice(monthlyPlan).toLocaleString('fr-FR')} DA` : '---',
      description: "Paiement mensuel",
      features,
      highlighted: false,
      planData: monthlyPlan,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        {/* Switch pour 1 enfant vs Famille */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label
            htmlFor="family-switch"
            className={`text-lg font-semibold cursor-pointer transition-colors ${!isFamily ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {t("pricing.switchOneChild")}
          </Label>
          <Switch
            id="family-switch"
            checked={isFamily}
            onCheckedChange={setIsFamily}
          />
          <Label
            htmlFor="family-switch"
            className={`text-lg font-semibold cursor-pointer transition-colors ${isFamily ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {t("pricing.switchFamily")}
          </Label>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayPlans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 ${plan.highlighted
                ? "border-2 border-primary shadow-xl"
                : "border border-border"
                } bg-card relative`}
            >
              <Button
                onClick={() => {
                  if (plan.planData) {
                    if (!user) {
                      sessionStorage.setItem('returnTo', '/abonnements');
                      navigate("/auth");
                      return;
                    }
                    navigate("/paiement", {
                      state: {
                        planId: plan.planData.id,
                        planName: plan.name,
                        price: getTotalPrice(plan.planData),
                        isFamily: isFamily,
                        billingPeriod: plan.planData.billing_period,
                        monthsCount: 12
                      }
                    });
                  }
                }}
                disabled={!plan.planData}
                className={`w-full font-bold mb-6 text-lg py-6 ${plan.highlighted
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-secondary text-secondary-foreground border-2 border-border hover:bg-secondary/80"
                  }`}
              >
                Choisir {plan.name}
              </Button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                {plan.description && (
                  <p className={`text-sm mb-4 ${i18n.language === 'ar' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{plan.description}</p>
                )}
                <div className="flex items-baseline justify-center gap-1 relative mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.highlighted && (
                    <span className="absolute -top-5 -right-2 bg-destructive text-destructive-foreground text-lg font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                      -30%
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
