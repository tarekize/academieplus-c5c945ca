import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ArabicKeyboardProvider } from "@/components/course/ArabicKeyboard";
import Index from "./pages/Index";
import ProtectedRoute from "@/components/ProtectedRoute";

const Contact = lazy(() => import("./pages/Contact"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ListeCours = lazy(() => import("./pages/ListeCours"));
const Cours = lazy(() => import("./pages/Cours"));
const Account = lazy(() => import("./pages/Account"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAbonnements = lazy(() => import("./pages/AdminAbonnements"));
const AdminContrats = lazy(() => import("./pages/AdminContrats"));
const AdminTokenUsage = lazy(() => import("./pages/AdminTokenUsage"));
const Factures = lazy(() => import("./pages/Factures"));
const MesInformations = lazy(() => import("./pages/MesInformations"));
const UpdateSuccess = lazy(() => import("./pages/UpdateSuccess"));
const Abonnements = lazy(() => import("./pages/Abonnements"));
const Paiement = lazy(() => import("./pages/Paiement"));
const Parrainage = lazy(() => import("./pages/Parrainage"));
const MesDonneesPersonnelles = lazy(() => import("./pages/MesDonneesPersonnelles"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ParentCoursView = lazy(() => import("./pages/ParentCoursView"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const EtablissementDashboard = lazy(() => import("./pages/EtablissementDashboard"));
const DashboardEditorial = lazy(() => import("./pages/editorial/DashboardEditorial"));
const EditeurCours = lazy(() => import("./pages/editorial/EditeurCours"));
const PageRevision = lazy(() => import("./pages/editorial/PageRevision"));
const Mediatheque = lazy(() => import("./pages/editorial/Mediatheque"));
const HistoriqueVersions = lazy(() => import("./pages/editorial/HistoriqueVersions"));
const PreviewCours = lazy(() => import("./pages/editorial/PreviewCours"));
const GestionEquipe = lazy(() => import("./pages/editorial/GestionEquipe"));
const CompareVersions = lazy(() => import("./pages/editorial/CompareVersions"));
const Analytics = lazy(() => import("./pages/Analytics"));
const FAQAdmin = lazy(() => import("./pages/FAQAdmin"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const LearningAssessment = lazy(() => import("./pages/LearningAssessment"));
const LessonEditor = lazy(() => import("./pages/LessonEditor"));
const ContentGeneration = lazy(() => import("./pages/ContentGeneration"));
const ExamTrimesterSelect = lazy(() => import("./pages/ExamTrimesterSelect"));
const ExamList = lazy(() => import("./pages/ExamList"));
const LessonRemediation = lazy(() => import("./pages/LessonRemediation"));
const JoinClass = lazy(() => import("./pages/JoinClass"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ArabicKeyboardProvider>
            <Suspense fallback={<RouteFallback />}>
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
              <Route path="/etablissement-dashboard" element={<ProtectedRoute allowedRoles={['etablissement']}><EtablissementDashboard /></ProtectedRoute>} />
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'pedago']}><Analytics /></ProtectedRoute>} />
              <Route path="/faq-admin" element={<ProtectedRoute allowedRoles={['admin', 'pedago']}><FAQAdmin /></ProtectedRoute>} />
              <Route path="/content-generation" element={<ProtectedRoute allowedRoles={['admin', 'pedago']}><ContentGeneration /></ProtectedRoute>} />
              <Route path="/remediation" element={<ProtectedRoute allowedRoles={['student']}><LessonRemediation /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute allowedRoles={['student', 'admin', 'pedago']}><ExamTrimesterSelect /></ProtectedRoute>} />
              <Route path="/exams/list" element={<ProtectedRoute allowedRoles={['student', 'admin', 'pedago']}><ExamList /></ProtectedRoute>} />
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
              <Route path="/admin/contrats" element={
                <ProtectedRoute requireAdmin>
                  <AdminContrats />
                </ProtectedRoute>
              } />
              <Route path="/admin/token-usage" element={
                <ProtectedRoute requireAdmin>
                  <AdminTokenUsage />
                </ProtectedRoute>
              } />
              <Route path="/rejoindre/:code" element={<JoinClass />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </ArabicKeyboardProvider>
          </AuthProvider>
        </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider >
);

export default App;
