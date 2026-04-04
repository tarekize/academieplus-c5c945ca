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
              Mentions Légales
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Éditeur du site</h2>
                <p className="text-muted-foreground">
                  Le site EduSuccess est édité par :<br />
                  <strong>EduSuccess SAS</strong><br />
                  Capital social : 50 000 €<br />
                  RCS Paris : 123 456 789<br />
                  Siège social : 123 Avenue des Champs-Élysées, 75008 Paris, France<br />
                  Téléphone : 01 23 45 67 89<br />
                  Email : contact@edusuccess.fr
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Directeur de la publication</h2>
                <p className="text-muted-foreground">
                  Le directeur de la publication est M. Jean Dupont, en sa qualité de Président de la société EduSuccess SAS.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Hébergement</h2>
                <p className="text-muted-foreground">
                  Le site est hébergé par :<br />
                  <strong>OVH</strong><br />
                  2 rue Kellermann<br />
                  59100 Roubaix, France<br />
                  Téléphone : 1007
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Propriété intellectuelle</h2>
                <p className="text-muted-foreground">
                  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                  Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Protection des données personnelles</h2>
                <p className="text-muted-foreground">
                  Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), 
                  vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
                </p>
                <p className="text-muted-foreground mt-2">
                  Pour en savoir plus sur la protection de vos données personnelles, consultez notre{" "}
                  <a href="/politique-confidentialite" className="text-primary hover:underline font-medium">
                    Politique de Confidentialité
                  </a>.
                </p>
                <p className="text-muted-foreground mt-2">
                  Pour exercer vos droits, vous pouvez nous contacter à l'adresse : <a href="mailto:contact@edusuccess.fr" className="text-primary hover:underline">contact@edusuccess.fr</a>
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies</h2>
                <p className="text-muted-foreground">
                  Le site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visite. 
                  Vous pouvez refuser l'utilisation des cookies en configurant votre navigateur.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitations de responsabilité</h2>
                <p className="text-muted-foreground">
                  EduSuccess ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, 
                  lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, 
                  soit de l'apparition d'un bug ou d'une incompatibilité.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Droit applicable</h2>
                <p className="text-muted-foreground">
                  Les présentes mentions légales sont régies par le droit français. En cas de litige, 
                  les tribunaux français seront seuls compétents.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour : Janvier 2025
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
