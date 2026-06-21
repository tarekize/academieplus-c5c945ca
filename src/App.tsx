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
import TeacherDashboard from "./pages/TeacherDashboard";
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
import LessonEditor from "./pages/LessonEditor";
import ContentGeneration from "./pages/ContentGeneration";
import ExamTrimesterSelect from "./pages/ExamTrimesterSelect";
import ExamList from "./pages/ExamList";
import LessonRemediation from "./pages/LessonRemediation";
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
              <Route path="/editorial" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><DashboardEditorial /></ProtectedRoute>} />
              <Route path="/editorial/cours/:id" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><EditeurCours /></ProtectedRoute>} />
              <Route path="/editorial/cours/:id/preview" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><PreviewCours /></ProtectedRoute>} />
              <Route path="/editorial/cours/:id/historique" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><HistoriqueVersions /></ProtectedRoute>} />
              <Route path="/editorial/cours/:id/compare" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><CompareVersions /></ProtectedRoute>} />
              <Route path="/editorial/revision" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><PageRevision /></ProtectedRoute>} />
              <Route path="/editorial/mediatheque" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><Mediatheque /></ProtectedRoute>} />
              <Route path="/editorial/equipe" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><GestionEquipe /></ProtectedRoute>} />
              <Route path="/editorial/historique/:id" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><HistoriqueVersions /></ProtectedRoute>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
              <Route path="/learning-assessment" element={<ProtectedRoute allowedRoles={['student']}><LearningAssessment /></ProtectedRoute>} />
              
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student', 'admin', 'pedago']}><Dashboard /></ProtectedRoute>} />
              <Route path="/parent-dashboard" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
              <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/parent-cours/:childId" element={<ProtectedRoute allowedRoles={['parent']}><ParentCoursView /></ProtectedRoute>} />
              <Route path="/account" element={
                <ProtectedRoute blockAdmin>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="/factures" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
              <Route path="/mes-informations" element={<ProtectedRoute><MesInformations /></ProtectedRoute>} />
              <Route path="/update-success" element={<ProtectedRoute><UpdateSuccess /></ProtectedRoute>} />
              <Route path="/abonnements" element={<ProtectedRoute><Abonnements /></ProtectedRoute>} />
              <Route path="/paiement" element={<ProtectedRoute><Paiement /></ProtectedRoute>} />
              <Route path="/parrainage" element={<ProtectedRoute><Parrainage /></ProtectedRoute>} />
              <Route path="/mes-donnees-personnelles" element={<ProtectedRoute><MesDonneesPersonnelles /></ProtectedRoute>} />
              <Route path="/liste-cours" element={<ProtectedRoute allowedRoles={['student', 'pedago', 'admin']}><ListeCours /></ProtectedRoute>} />
              <Route path="/cours/:subjectId" element={<ProtectedRoute allowedRoles={['student', 'pedago', 'admin']}><Cours /></ProtectedRoute>} />
              <Route path="/lecon/:lessonId" element={<ProtectedRoute allowedRoles={['pedago', 'admin']}><LessonEditor /></ProtectedRoute>} />
              <Route path="/revision/:subjectId" element={<ProtectedRoute allowedRoles={['student', 'pedago', 'admin']}><Revision /></ProtectedRoute>} />
              <Route path="/simulation/:subjectId" element={<ProtectedRoute allowedRoles={['student', 'pedago', 'admin']}><Simulation /></ProtectedRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'pedago']}><Analytics /></ProtectedRoute>} />
              <Route path="/faq-admin" element={<ProtectedRoute allowedRoles={['admin', 'pedago']}><FAQAdmin /></ProtectedRoute>} />
              <Route path="/content-generation" element={<ProtectedRoute allowedRoles={['admin', 'pedago']}><ContentGeneration /></ProtectedRoute>} />
              <Route path="/remediation" element={<ProtectedRoute allowedRoles={['student']}><LessonRemediation /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute allowedRoles={['student']}><ExamTrimesterSelect /></ProtectedRoute>} />
              <Route path="/exams/list" element={<ProtectedRoute allowedRoles={['student']}><ExamList /></ProtectedRoute>} />
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
  </QueryClientProvider >
);

export default App;
