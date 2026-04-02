import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SubjectsCarousel from "@/components/SubjectsCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import Excellence from "@/components/Excellence";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
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
