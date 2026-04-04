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
              Politique de ConfidentialitÃ©
            </h1>
            <p className="text-xl opacity-90">
              Protection des donnÃ©es personnelles - RGPD
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none space-y-8">
              
              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
                <p className="text-foreground font-medium mb-2">
                  DerniÃ¨re mise Ã  jour : Janvier 2025
                </p>
                <p className="text-muted-foreground text-sm">
                  EduSuccess s'engage Ã  protÃ©ger la vie privÃ©e de ses utilisateurs conformÃ©ment au RÃ¨glement GÃ©nÃ©ral sur la Protection des DonnÃ©es (RGPD) et Ã  la loi Informatique et LibertÃ©s.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Responsable du traitement</h2>
                <p className="text-muted-foreground">
                  Le responsable du traitement des donnÃ©es personnelles est :<br />
                  <strong>EduSuccess SAS</strong><br />
                  123 Avenue des Champs-Ã‰lysÃ©es, 75008 Paris, France<br />
                  Email : <a href="mailto:contact@edusuccess.fr" className="text-primary hover:underline">contact@edusuccess.fr</a><br />
                  TÃ©lÃ©phone : 01 23 45 67 89
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. DonnÃ©es personnelles collectÃ©es</h2>
                <p className="text-muted-foreground mb-4">
                  Nous collectons les donnÃ©es suivantes lors de votre inscription et utilisation de nos services :
                </p>
                
                <div className="space-y-3">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ“ DonnÃ©es d'identification</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>PrÃ©nom et nom</li>
                      <li>Adresse email</li>
                      <li>Date de naissance</li>
                      <li>Type de profil (Ã©lÃ¨ve ou parent)</li>
                      <li>Niveau de classe (pour les Ã©lÃ¨ves)</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ“š DonnÃ©es d'utilisation</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Historique de consultation des cours</li>
                      <li>RÃ©sultats aux examens et simulations</li>
                      <li>Progression dans les matiÃ¨res</li>
                      <li>Historique des révisions</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ’³ DonnÃ©es de facturation</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Type et statut d'abonnement</li>
                      <li>Historique des paiements</li>
                      <li>Factures (conservÃ©es 10 ans - obligation lÃ©gale)</li>
                      <li>Codes de parrainage utilisÃ©s</li>
                    </ul>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ”’ DonnÃ©es techniques</h3>
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
                <h2 className="text-2xl font-bold text-foreground mb-4">3. FinalitÃ©s du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Vos donnÃ©es sont collectÃ©es pour les finalitÃ©s suivantes :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Gestion de votre compte</strong> : crÃ©ation, authentification, gestion de profil</li>
                  <li><strong>Fourniture des services Ã©ducatifs</strong> : accÃ¨s aux cours, examens, révisions</li>
                  <li><strong>Suivi pÃ©dagogique</strong> : analyse de la progression, recommandations personnalisÃ©es</li>
                  <li><strong>Facturation</strong> : gestion des abonnements, paiements, factures</li>
                  <li><strong>Programme de parrainage</strong> : attribution et suivi des rÃ©ductions</li>
                  <li><strong>Communication</strong> : notifications importantes, support client</li>
                  <li><strong>AmÃ©lioration des services</strong> : analyses statistiques anonymisÃ©es</li>
                  <li><strong>SÃ©curitÃ©</strong> : prÃ©vention des fraudes, protection des comptes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Base lÃ©gale du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Le traitement de vos donnÃ©es personnelles repose sur :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Votre consentement</strong> : donnÃ© lors de l'inscription</li>
                  <li><strong>L'exÃ©cution du contrat</strong> : fourniture des services souscrits</li>
                  <li><strong>Nos obligations lÃ©gales</strong> : conservation des factures, lutte contre la fraude</li>
                  <li><strong>Notre intÃ©rÃªt lÃ©gitime</strong> : amÃ©lioration des services, sÃ©curitÃ© de la plateforme</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Protection des donnÃ©es des mineurs</h2>
                <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                  <p className="text-foreground font-medium mb-3">
                    âš ï¸ Protection renforcÃ©e pour les mineurs (moins de 18 ans)
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Les donnÃ©es des mineurs sont traitÃ©es avec une protection renforcÃ©e</li>
                    <li>Pour les mineurs de moins de 15 ans, le consentement parental est requis</li>
                    <li>Les parents ont un droit de regard sur les donnÃ©es de leurs enfants</li>
                    <li>AccÃ¨s restreint aux donnÃ©es sensibles (rÃ©sultats, progression)</li>
                    <li>Anonymisation automatique des donnÃ©es Ã  la majoritÃ© (option)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. DurÃ©e de conservation des donnÃ©es</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ðŸ‘¤</span>
                    <div>
                      <p className="font-semibold text-foreground">Comptes actifs</p>
                      <p className="text-muted-foreground">DonnÃ©es conservÃ©es tant que le compte est actif</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ðŸ’¤</span>
                    <div>
                      <p className="font-semibold text-foreground">Comptes inactifs</p>
                      <p className="text-muted-foreground">Suppression automatique aprÃ¨s 3 ans d'inactivitÃ© (obligation lÃ©gale)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ðŸ§¾</span>
                    <div>
                      <p className="font-semibold text-foreground">Factures</p>
                      <p className="text-muted-foreground">Conservation 10 ans (obligation comptable et fiscale)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ðŸ—‘ï¸</span>
                    <div>
                      <p className="font-semibold text-foreground">Comptes supprimÃ©s</p>
                      <p className="text-muted-foreground">DonnÃ©es anonymisÃ©es conservÃ©es 3 ans maximum, puis suppression dÃ©finitive</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ðŸ“Š</span>
                    <div>
                      <p className="font-semibold text-foreground">Logs et statistiques</p>
                      <p className="text-muted-foreground">Conservation 1 an maximum</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Destinataires des donnÃ©es</h2>
                <p className="text-muted-foreground mb-4">
                  Vos donnÃ©es personnelles sont accessibles uniquement par :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Le personnel autorisÃ© d'EduSuccess</strong> : pour la gestion et le support</li>
                  <li><strong>Prestataires techniques</strong> : hÃ©bergement (OVH), authentification (Supabase)</li>
                  <li><strong>Processeurs de paiement</strong> : pour la gestion des transactions (donnÃ©es bancaires sÃ©curisÃ©es)</li>
                  <li><strong>AutoritÃ©s lÃ©gales</strong> : uniquement sur rÃ©quisition judiciaire</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  âŒ Nous ne vendons jamais vos donnÃ©es Ã  des tiers.<br />
                  âŒ Nous ne partageons pas vos donnÃ©es Ã  des fins publicitaires.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Transfert de donnÃ©es hors UE</h2>
                <p className="text-muted-foreground">
                  Vos donnÃ©es sont stockÃ©es dans l'Union EuropÃ©enne (France). Aucun transfert hors UE n'est effectuÃ©, 
                  garantissant le plus haut niveau de protection RGPD.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Vos droits sur vos donnÃ©es</h2>
                <p className="text-muted-foreground mb-4">
                  ConformÃ©ment au RGPD, vous disposez des droits suivants :
                </p>
                
                <div className="grid gap-4">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ” Droit d'accÃ¨s</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez consulter toutes vos donnÃ©es personnelles Ã  tout moment depuis votre compte.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">âœï¸ Droit de rectification</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez modifier vos informations personnelles directement dans votre compte.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ—‘ï¸ Droit Ã  l'effacement (droit Ã  l'oubli)</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez supprimer votre compte et toutes vos donnÃ©es Ã  tout moment (sauf donnÃ©es soumises Ã  obligation lÃ©gale de conservation).
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">ðŸ“¥ Droit Ã  la portabilitÃ©</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez exporter toutes vos donnÃ©es dans un format structurÃ© (JSON, PDF).
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">â›” Droit d'opposition</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez vous opposer au traitement de vos donnÃ©es Ã  des fins statistiques ou marketing.
                    </p>
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">â¸ï¸ Droit Ã  la limitation</h3>
                    <p className="text-muted-foreground">
                      Vous pouvez demander la limitation du traitement de vos donnÃ©es dans certains cas.
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
                    <li><strong>Depuis votre compte</strong> : accÃ©der Ã  la section "Mes DonnÃ©es Personnelles"</li>
                    <li><strong>Par email</strong> : <a href="mailto:contact@edusuccess.fr" className="text-primary hover:underline">contact@edusuccess.fr</a></li>
                    <li><strong>Par courrier</strong> : EduSuccess SAS, 123 Avenue des Champs-Ã‰lysÃ©es, 75008 Paris</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Nous nous engageons Ã  rÃ©pondre Ã  votre demande dans un dÃ©lai maximum de <strong>1 mois</strong>.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Cookies et technologies similaires</h2>
                <p className="text-muted-foreground mb-4">
                  Nous utilisons des cookies strictement nÃ©cessaires au fonctionnement du site :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Cookies d'authentification</strong> : maintien de votre session</li>
                  <li><strong>Cookies de prÃ©fÃ©rences</strong> : langue, thÃ¨me</li>
                  <li><strong>Cookies de sÃ©curitÃ©</strong> : protection contre les attaques</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  âŒ Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. SÃ©curitÃ© des donnÃ©es</h2>
                <p className="text-muted-foreground mb-4">
                  Nous mettons en Å“uvre des mesures de sÃ©curitÃ© techniques et organisationnelles pour protÃ©ger vos donnÃ©es :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>âœ… Chiffrement des communications (HTTPS/TLS)</li>
                  <li>âœ… Chiffrement des mots de passe (bcrypt)</li>
                  <li>âœ… Authentification multi-facteurs (disponible)</li>
                  <li>âœ… HÃ©bergement sÃ©curisÃ© certifiÃ© (ISO 27001)</li>
                  <li>âœ… Sauvegardes quotidiennes chiffrÃ©es</li>
                  <li>âœ… ContrÃ´le d'accÃ¨s strict aux donnÃ©es</li>
                  <li>âœ… Surveillance et dÃ©tection des intrusions</li>
                  <li>âœ… Tests de sÃ©curitÃ© rÃ©guliers</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Notification de violation de donnÃ©es</h2>
                <p className="text-muted-foreground">
                  En cas de violation de donnÃ©es susceptible d'engendrer un risque Ã©levÃ© pour vos droits et libertÃ©s, 
                  nous nous engageons Ã  vous en informer dans les <strong>72 heures</strong> et Ã  notifier la CNIL conformÃ©ment au RGPD.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Modifications de la politique</h2>
                <p className="text-muted-foreground">
                  Cette politique de confidentialitÃ© peut Ãªtre modifiÃ©e pour reflÃ©ter les Ã©volutions de nos services ou de la lÃ©gislation. 
                  Toute modification substantielle vous sera notifiÃ©e par email et/ou notification sur le site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">15. RÃ©clamation auprÃ¨s de la CNIL</h2>
                <p className="text-muted-foreground mb-4">
                  Si vous estimez que vos droits ne sont pas respectÃ©s, vous pouvez introduire une rÃ©clamation auprÃ¨s de la CNIL :
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <p className="text-muted-foreground">
                    <strong>Commission Nationale de l'Informatique et des LibertÃ©s (CNIL)</strong><br />
                    3 Place de Fontenoy, TSA 80715<br />
                    75334 Paris Cedex 07<br />
                    TÃ©lÃ©phone : 01 53 73 22 22<br />
                    Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">16. Contact</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute question concernant cette politique de confidentialitÃ© ou le traitement de vos donnÃ©es :
                </p>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <p className="text-foreground font-semibold mb-3">EduSuccess - Service Protection des DonnÃ©es</p>
                  <p className="text-muted-foreground">
                    ðŸ“§ Email : <a href="mailto:dpo@edusuccess.fr" className="text-primary hover:underline">dpo@edusuccess.fr</a><br />
                    ðŸ“ž TÃ©lÃ©phone : 01 23 45 67 89<br />
                    ðŸ“® Courrier : 123 Avenue des Champs-Ã‰lysÃ©es, 75008 Paris, France
                  </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      DerniÃ¨re mise Ã  jour : Janvier 2025
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Version : 1.0
                    </p>
                  </div>
                  <Link 
                    to="/mentions-legales" 
                    className="text-sm text-primary hover:underline"
                  >
                    Voir les Mentions LÃ©gales â†’
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
