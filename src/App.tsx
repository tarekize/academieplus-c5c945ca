import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

import Dashboard from "./pages/Dashboard";
import ListeCours from "./pages/ListeCours";
import Cours from "./pages/Cours";
import Revision from "./pages/Revision";
import Simulation from "./pages/Simulation";
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminAbonnements from "./pages/AdminAbonnements";
import Factures from "./pages/Factures";
import MesInformations from "./pages/MesInformations";
import UpdateSuccess from "./pages/UpdateSuccess";
import Abonnements from "./pages/Abonnements";
import Paiement from "./pages/Paiement";
import Parrainage from "./pages/Parrainage";
import MesDonneesPersonnelles from "./pages/MesDonneesPersonnelles";
import ParentDashboard from "./pages/ParentDashboard";
import ParentCoursView from "./pages/ParentCoursView";
import DashboardEditorial from "./pages/editorial/DashboardEditorial";
import EditeurCours from "./pages/editorial/EditeurCours";
import PageRevision from "./pages/editorial/PageRevision";
import Mediatheque from "./pages/editorial/Mediatheque";
import HistoriqueVersions from "./pages/editorial/HistoriqueVersions";
import PreviewCours from "./pages/editorial/PreviewCours";
import GestionEquipe from "./pages/editorial/GestionEquipe";
import CompareVersions from "./pages/editorial/CompareVersions";
import Analytics from "./pages/Analytics";
import FAQAdmin from "./pages/FAQAdmin";
import CompleteProfile from "./pages/CompleteProfile";
import LearningAssessment from "./pages/LearningAssessment";
import BotOnboardingPage from "./pages/BotOnboardingPage";
import LessonEditor from "./pages/LessonEditor";
import ContentGeneration from "./pages/ContentGeneration";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/editorial" element={<DashboardEditorial />} />
              <Route path="/editorial/cours/:id" element={<EditeurCours />} />
              <Route path="/editorial/cours/:id/preview" element={<PreviewCours />} />
              <Route path="/editorial/cours/:id/historique" element={<HistoriqueVersions />} />
              <Route path="/editorial/cours/:id/compare" element={<CompareVersions />} />
              <Route path="/editorial/revision" element={<PageRevision />} />
              <Route path="/editorial/mediatheque" element={<Mediatheque />} />
              <Route path="/editorial/equipe" element={<GestionEquipe />} />
              <Route path="/editorial/historique/:id" element={<HistoriqueVersions />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/learning-assessment" element={<LearningAssessment />} />
              <Route path="/bot-onboarding" element={<BotOnboardingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
              <Route path="/parent-cours/:childId" element={<ParentCoursView />} />
              <Route path="/account" element={
                <ProtectedRoute blockAdmin>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="/factures" element={<Factures />} />
              <Route path="/mes-informations" element={<MesInformations />} />
              <Route path="/update-success" element={<UpdateSuccess />} />
              <Route path="/abonnements" element={<Abonnements />} />
              <Route path="/paiement" element={<Paiement />} />
              <Route path="/parrainage" element={<Parrainage />} />
              <Route path="/mes-donnees-personnelles" element={<MesDonneesPersonnelles />} />
              <Route path="/liste-cours" element={<ListeCours />} />
              <Route path="/cours/:subjectId" element={<Cours />} />
              <Route path="/lecon/:lessonId" element={<LessonEditor />} />
              <Route path="/revision/:subjectId" element={<Revision />} />
              <Route path="/simulation/:subjectId" element={<Simulation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/faq-admin" element={<FAQAdmin />} />
              <Route path="/content-generation" element={<ContentGeneration />} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/admin/abonnements" element={
                <ProtectedRoute requireAdmin>
                  <AdminAbonnements />
                </ProtectedRoute>
              } />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
