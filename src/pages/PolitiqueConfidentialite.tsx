import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary to-accent py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-xl opacity-90">
              Protection des données personnelles - RGPD
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none space-y-8">
              
              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
                <p className="text-foreground font-medium mb-2">
                  Dernière mise à jour : Janvier 2025
                </p>
                <p className="text-muted-foreground text-sm">
                  EduSuccess s'engage à protéger la vie privée de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Responsable du traitement</h2>
                <p className="text-muted-foreground">
                  Le responsable du traitement des données personnelles est :<br />
                  <strong>EduSuccess SAS</strong><br />
                  123 Avenue des Champs-Élysées, 75008 Paris, France<br />
                  Email : <a href="mailto:contact@edusuccess.fr" className="text-primary hover:underline">contact@edusuccess.fr</a><br />
                  Téléphone : 01 23 45 67 89
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Données personnelles collectées</h2>
                <p className="text-muted-foreground mb-4">
                  Nous collectons les données suivantes lors de votre inscription et utilisation de nos services :
                </p>
                
                <div className="space-y-3">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">📝 Données d'identification</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Prénom et nom</li>
                      <li>Adresse email</li>
                      <li>Date de naissance</li>
                      <li>Type de profil (élève ou parent)</li>
                      <li>Niveau de classe (pour les élèves)</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">📚 Données d'utilisation</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Historique de consultation des cours</li>
                      <li>Résultats aux examens et simulations</li>
                      <li>Progression dans les matières</li>
                      <li>Historique des révisions</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">💳 Données de facturation</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Type et statut d'abonnement</li>
                      <li>Historique des paiements</li>
                      <li>Factures (conservées 10 ans - obligation légale)</li>
                      <li>Codes de parrainage utilisés</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">🔒 Données techniques</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Adresse IP</li>
                      <li>Type de navigateur et appareil</li>
                      <li>Cookies de session</li>
                      <li>Logs de connexion</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Finalités du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Vos données sont collectées pour les finalités suivantes :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Gestion de votre compte</strong> : création, authentification, gestion de profil</li>
                  <li><strong>Fourniture des services éducatifs</strong> : accès aux cours, examens, révisions</li>
                  <li><strong>Suivi pédagogique</strong> : analyse de la progression, recommandations personnalisées</li>
                  <li><strong>Facturation</strong> : gestion des abonnements, paiements, factures</li>
                  <li><strong>Programme de parrainage</strong> : attribution et suivi des réductions</li>
                  <li><strong>Communication</strong> : notifications importantes, support client</li>
                  <li><strong>Amélioration des services</strong> : analyses statistiques anonymisées</li>
                  <li><strong>Sécurité</strong> : prévention des fraudes, protection des comptes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Base légale du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Le traitement de vos données personnelles repose sur :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Votre consentement</strong> : donné lors de l'inscription</li>
                  <li><strong>L'exécution du contrat</strong> : fourniture des services souscrits</li>
                  <li><strong>Nos obligations légales</strong> : conservation des factures, lutte contre la fraude</li>
                  <li><strong>Notre intérêt légitime</strong> : amélioration des services, sécurité de la plateforme</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Protection des données des mineurs</h2>
                <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                  <p className="text-foreground font-medium mb-3">
                    ⚠️ Protection renforcée pour les mineurs (moins de 18 ans)
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Les données des mineurs sont traitées avec une protection renforcée</li>
                    <li>Pour les mineurs de moins de 15 ans, le consentement parental est requis</li>
                    <li>Les parents ont un droit de regard sur les données de leurs enfants</li>
                    <li>Accès restreint aux données sensibles (résultats, progression)</li>
                    <li>Anonymisation automatique des données à la majorité (option)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Durée de conservation des données</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="font-semibold text-foreground">Comptes actifs</p>
                      <p className="text-muted-foreground">Données conservées tant que le compte est actif</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💤</span>
                    <div>
                      <p className="font-semibold text-foreground">Comptes inactifs</p>
                      <p className="text-muted-foreground">Suppression automatique après 3 ans d'inactivité (obligation légale)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🧾</span>
                    <div>
                      <p className="font-semibold text-foreground">Factures</p>
                      <p className="text-muted-foreground">Conservation 10 ans (obligation comptable et fiscale)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🗑️</span>
                    <div>
                      <p className="font-semibold text-foreground">Comptes supprimés</p>
                      <p className="text-muted-foreground">Données anonymisées conservées 3 ans maximum, puis suppression définitive</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-semibold text-foreground">Logs et statistiques</p>
                      <p className="text-muted-foreground">Conservation 1 an maximum</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Destinataires des données</h2>
                <p className="text-muted-foreground mb-4">
                  Vos données personnelles sont accessibles uniquement par :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Le personnel autorisé d'EduSuccess</strong> : pour la gestion et le support</li>
                  <li><strong>Prestataires techniques</strong> : hébergement (OVH), authentification (Supabase)</li>
                  <li><strong>Processeurs de paiement</strong> : pour la gestion des transactions (données bancaires sécurisées)</li>
                  <li><strong>Autorités légales</strong> : uniquement sur réquisition judiciaire</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  ❌ Nous ne vendons jamais vos données à des tiers.<br />
                  ❌ Nous ne partageons pas vos données à des fins publicitaires.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Transfert de données hors UE</h2>
                <p className="text-muted-foreground">
                  Vos données sont stockées dans l'Union Européenne (France). Aucun transfert hors UE n'est effectué, 
                  garantissant le plus haut niveau de protection RGPD.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Vos droits sur vos données</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                
                <div className="grid gap-4">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">🔍 Droit d'accès</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez consulter toutes vos données personnelles à tout moment depuis votre compte.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">✏️ Droit de rectification</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez modifier vos informations personnelles directement dans votre compte.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">🗑️ Droit à l'effacement (droit à l'oubli)</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez supprimer votre compte et toutes vos données à tout moment (sauf données soumises à obligation légale de conservation).
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">📥 Droit à la portabilité</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez exporter toutes vos données dans un format structuré (JSON, PDF).
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">⛔ Droit d'opposition</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez vous opposer au traitement de vos données à des fins statistiques ou marketing.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">⏸️ Droit à la limitation</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez demander la limitation du traitement de vos données dans certains cas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Exercice de vos droits</h2>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <p className="text-foreground font-medium mb-4">
                    Pour exercer vos droits, vous pouvez :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li><strong>Depuis votre compte</strong> : accéder à la section "Mes Données Personnelles"</li>
                    <li><strong>Par email</strong> : <a href="mailto:contact@edusuccess.fr" className="text-primary hover:underline">contact@edusuccess.fr</a></li>
                    <li><strong>Par courrier</strong> : EduSuccess SAS, 123 Avenue des Champs-Élysées, 75008 Paris</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Nous nous engageons à répondre à votre demande dans un délai maximum de <strong>1 mois</strong>.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Cookies et technologies similaires</h2>
                <p className="text-muted-foreground mb-4">
                  Nous utilisons des cookies strictement nécessaires au fonctionnement du site :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Cookies d'authentification</strong> : maintien de votre session</li>
                  <li><strong>Cookies de préférences</strong> : langue, thème</li>
                  <li><strong>Cookies de sécurité</strong> : protection contre les attaques</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  ❌ Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Sécurité des données</h2>
                <p className="text-muted-foreground mb-4">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>✅ Chiffrement des communications (HTTPS/TLS)</li>
                  <li>✅ Chiffrement des mots de passe (bcrypt)</li>
                  <li>✅ Authentification multi-facteurs (disponible)</li>
                  <li>✅ Hébergement sécurisé certifié (ISO 27001)</li>
                  <li>✅ Sauvegardes quotidiennes chiffrées</li>
                  <li>✅ Contrôle d'accès strict aux données</li>
                  <li>✅ Surveillance et détection des intrusions</li>
                  <li>✅ Tests de sécurité réguliers</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Notification de violation de données</h2>
                <p className="text-muted-foreground">
                  En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et libertés, 
                  nous nous engageons à vous en informer dans les <strong>72 heures</strong> et à notifier la CNIL conformément au RGPD.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Modifications de la politique</h2>
                <p className="text-muted-foreground">
                  Cette politique de confidentialité peut être modifiée pour refléter les évolutions de nos services ou de la législation. 
                  Toute modification substantielle vous sera notifiée par email et/ou notification sur le site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">15. Réclamation auprès de la CNIL</h2>
                <p className="text-muted-foreground mb-4">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <p className="text-muted-foreground">
                    <strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong><br />
                    3 Place de Fontenoy, TSA 80715<br />
                    75334 Paris Cedex 07<br />
                    Téléphone : 01 53 73 22 22<br />
                    Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">16. Contact</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données :
                </p>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <p className="text-foreground font-semibold mb-3">EduSuccess - Service Protection des Données</p>
                  <p className="text-muted-foreground">
                    📧 Email : <a href="mailto:dpo@edusuccess.fr" className="text-primary hover:underline">dpo@edusuccess.fr</a><br />
                    📞 Téléphone : 01 23 45 67 89<br />
                    📮 Courrier : 123 Avenue des Champs-Élysées, 75008 Paris, France
                  </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Dernière mise à jour : Janvier 2025
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Version : 1.0
                    </p>
                  </div>
                  <Link 
                    to="/mentions-legales" 
                    className="text-sm text-primary hover:underline"
                  >
                    Voir les Mentions Légales →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PolitiqueConfidentialite;
