import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary to-accent py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mentions LÃ©gales
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Ã‰diteur du site</h2>
                <p className="text-muted-foreground">
                  Le site EduSuccess est Ã©ditÃ© par :<br />
                  <strong>EduSuccess SAS</strong><br />
                  Capital social : 50 000 â‚¬<br />
                  RCS Paris : 123 456 789<br />
                  SiÃ¨ge social : 123 Avenue des Champs-Ã‰lysÃ©es, 75008 Paris, France<br />
                  TÃ©lÃ©phone : 01 23 45 67 89<br />
                  Email : contact@edusuccess.fr
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Directeur de la publication</h2>
                <p className="text-muted-foreground">
                  Le directeur de la publication est M. Jean Dupont, en sa qualitÃ© de PrÃ©sident de la sociÃ©tÃ© EduSuccess SAS.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. HÃ©bergement</h2>
                <p className="text-muted-foreground">
                  Le site est hÃ©bergÃ© par :<br />
                  <strong>OVH</strong><br />
                  2 rue Kellermann<br />
                  59100 Roubaix, France<br />
                  TÃ©lÃ©phone : 1007
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. PropriÃ©tÃ© intellectuelle</h2>
                <p className="text-muted-foreground">
                  L'ensemble de ce site relÃ¨ve de la lÃ©gislation franÃ§aise et internationale sur le droit d'auteur et la propriÃ©tÃ© intellectuelle. 
                  Tous les droits de reproduction sont rÃ©servÃ©s, y compris pour les documents tÃ©lÃ©chargeables et les reprÃ©sentations iconographiques et photographiques.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Protection des donnÃ©es personnelles</h2>
                <p className="text-muted-foreground">
                  ConformÃ©ment Ã  la loi Â« Informatique et LibertÃ©s Â» du 6 janvier 1978 modifiÃ©e et au RÃ¨glement GÃ©nÃ©ral sur la Protection des DonnÃ©es (RGPD), 
                  vous disposez d'un droit d'accÃ¨s, de rectification et de suppression des donnÃ©es vous concernant.
                </p>
                <p className="text-muted-foreground mt-2">
                  Pour en savoir plus sur la protection de vos donnÃ©es personnelles, consultez notre{" "}
                  <a href="/politique-confidentialite" className="text-primary hover:underline font-medium">
                    Politique de ConfidentialitÃ©
                  </a>.
                </p>
                <p className="text-muted-foreground mt-2">
                  Pour exercer vos droits, vous pouvez nous contacter Ã  l'adresse : <a href="mailto:contact@edusuccess.fr" className="text-primary hover:underline">contact@edusuccess.fr</a>
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies</h2>
                <p className="text-muted-foreground">
                  Le site utilise des cookies pour amÃ©liorer l'expÃ©rience utilisateur et rÃ©aliser des statistiques de visite. 
                  Vous pouvez refuser l'utilisation des cookies en configurant votre navigateur.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitations de responsabilitÃ©</h2>
                <p className="text-muted-foreground">
                  EduSuccess ne pourra Ãªtre tenu responsable des dommages directs et indirects causÃ©s au matÃ©riel de l'utilisateur, 
                  lors de l'accÃ¨s au site, et rÃ©sultant soit de l'utilisation d'un matÃ©riel ne rÃ©pondant pas aux spÃ©cifications indiquÃ©es, 
                  soit de l'apparition d'un bug ou d'une incompatibilitÃ©.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Droit applicable</h2>
                <p className="text-muted-foreground">
                  Les prÃ©sentes mentions lÃ©gales sont rÃ©gies par le droit franÃ§ais. En cas de litige, 
                  les tribunaux franÃ§ais seront seuls compÃ©tents.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  DerniÃ¨re mise Ã  jour : Janvier 2025
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MentionsLegales;
