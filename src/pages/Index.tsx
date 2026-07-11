import { Capacitor } from "@capacitor/core";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SubjectsCarousel from "@/components/SubjectsCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import Excellence from "@/components/Excellence";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import MobileHome from "@/components/MobileHome";

const Index = () => {
  // The native app (Android/iOS) gets a minimal landing screen — the full
  // marketing page below is for the web only.
  if (Capacitor.isNativePlatform()) {
    return <MobileHome />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <SubjectsCarousel />
      <WhyChooseUs />
      <Excellence />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
