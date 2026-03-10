import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, GraduationCap, LogOut, User as UserIcon, FileText, Receipt, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import jsPDF from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school_level: string | null;
  avatar_url: string | null;
}

interface Payment {
  id: string;
  amount: number;
  plan_type: string;
  plan_label: string;
  status: string;
  payment_date: string;
  created_at: string;
  children_count: number;
  is_family: boolean;
}

const Factures = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchPayments(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchPayments(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, school_level, avatar_url")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (userId: string) => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false });
    if (data) setPayments(data as Payment[]);
  };

  const getFullName = (p: Profile | null): string => {
    if (!p) return "Utilisateur";
    const parts = [p.first_name, p.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const getSchoolLevelName = (level: string) => {
    const levels: Record<string, string> = {
      cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM1', cm2: 'CM2',
      sixieme: '6ème', cinquieme: '5ème', quatrieme: '4ème', troisieme: '3ème',
      seconde: 'Seconde', premiere: 'Première', terminale: 'Terminale'
    };
    return levels[level] || 'Votre classe';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté avec succès" });
    navigate("/");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  const formatDateTimeFull = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} a ${hours}:${minutes}:${seconds}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' DA';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">Payé</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const generateInvoiceNumber = (payment: Payment) => {
    const date = new Date(payment.payment_date);
    return `FA-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${payment.id.slice(0, 6).toUpperCase()}`;
  };

  const handleDownloadInvoice = (payment: Payment) => {
    const doc = new jsPDF();
    const invoiceNum = generateInvoiceNumber(payment);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // ── Accent color ──
    const accent = [79, 70, 229]; // indigo-600
    const accentLight = [238, 242, 255]; // indigo-50
    const dark = [15, 23, 42];
    const gray = [100, 116, 139];
    const lightGray = [241, 245, 249];

    // ── Left accent bar ──
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, 0, 6, ph, "F");

    // ── Header section ──
    // Logo circle
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.circle(28, 28, 12, "F");
    // Inner ring
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.5);
    doc.circle(28, 28, 8, "S");
    // Graduation cap icon text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("A+", 28, 31, { align: "center" });

    // Brand name
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Academie", 46, 25);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text("Plus", 46 + doc.getTextWidth("Academie"), 25);

    // Tagline
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("Votre partenaire educatif de confiance", 46, 32);

    // ── FACTURE badge (top right) ──
    const badgeW = 52;
    const badgeH = 14;
    const badgeX = pw - 15 - badgeW;
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(badgeX, 16, badgeW, badgeH, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURE", badgeX + badgeW / 2, 26, { align: "center" });

    // Invoice number & date below badge
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`N  ${invoiceNum}`, pw - 15, 40, { align: "right" });
    doc.text(`Date : ${formatDateTimeFull(payment.payment_date)}`, pw - 15, 47, { align: "right" });

    // ── Divider ──
    let y = 56;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, pw - 15, y);

    // ── Two-column info section ──
    y = 66;

    // Left: Facturé à
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(15, y, (pw - 40) / 2, 40, 4, 4, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text("FACTURE A", 22, y + 10);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(getFullName(profile), 22, y + 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(profile?.email || "—", 22, y + 28);

    // Right: Détails
    const rightX = 15 + (pw - 40) / 2 + 10;
    doc.setFillColor(accentLight[0], accentLight[1], accentLight[2]);
    doc.roundedRect(rightX, y, (pw - 40) / 2, 40, 4, 4, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text("DETAILS DE FACTURATION", rightX + 7, y + 10);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(dark[0], dark[1], dark[2]);
    const typeLabel = payment.is_family
      ? `Famille (${payment.children_count} enfant${payment.children_count > 1 ? "s" : ""})`
      : "Individuel";
    doc.text(`Type : ${typeLabel}`, rightX + 7, y + 20);
    doc.text(`Formule : ${payment.plan_label}`, rightX + 7, y + 28);

    // ── Items table ──
    y = 118;

    // Table header
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.roundedRect(15, y, pw - 30, 14, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", 22, y + 9);
    doc.text("QTE", pw / 2, y + 9, { align: "center" });
    doc.text("MONTANT", pw - 22, y + 9, { align: "right" });

    // Table row
    y += 20;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(15, y - 4, pw - 30, 16, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(payment.plan_label, 22, y + 6);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("1", pw / 2, y + 6, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(formatCurrency(payment.amount), pw - 22, y + 6, { align: "right" });

    // ── Totals section (right-aligned) ──
    y += 28;
    const totalsX = pw - 100;

    // Sous-total
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("Sous-total", totalsX, y);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(formatCurrency(payment.amount), pw - 22, y, { align: "right" });

    // Divider
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(totalsX - 5, y, pw - 15, y);

    // Total with accent bg
    y += 4;
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(totalsX - 5, y, pw - 15 - totalsX + 5, 16, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL TTC", totalsX + 2, y + 11);
    doc.setFontSize(14);
    doc.text(formatCurrency(payment.amount), pw - 22, y + 11, { align: "right" });

    // ── Status badge (left of totals) ──
    const statusText = payment.status === "completed" ? "PAYE" : "EN ATTENTE";
    if (payment.status === "completed") {
      doc.setFillColor(220, 252, 231);
      doc.setDrawColor(34, 197, 94);
    } else {
      doc.setFillColor(254, 249, 195);
      doc.setDrawColor(234, 179, 8);
    }
    doc.setLineWidth(0.6);
    const statusBadgeW = doc.getTextWidth(statusText) * 1.2 + 16;
    doc.roundedRect(15, y + 1, statusBadgeW, 14, 3, 3, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    if (payment.status === "completed") {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(161, 98, 7);
    }
    doc.text(statusText, 22, y + 10);

    // ── Thank you section ──
    y += 40;
    doc.setFillColor(accentLight[0], accentLight[1], accentLight[2]);
    doc.roundedRect(15, y, pw - 30, 28, 4, 4, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text("Merci pour votre confiance !", pw / 2, y + 12, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("Pour toute question, contactez-nous a support@academieplus.dz", pw / 2, y + 21, { align: "center" });

    // ── Footer ──
    const footerY = ph - 20;
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, footerY - 4, pw, 24, "F");
    // Overwrite left bar color on footer
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, footerY - 4, 6, 24, "F");

    doc.setTextColor(180, 190, 210);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("AcadémiePlus — Votre partenaire éducatif de confiance", pw / 2, footerY + 6, { align: "center" });
    doc.text("www.academieplus.dz  |  contact@academieplus.dz", pw / 2, footerY + 12, { align: "center" });

    doc.save(`${invoiceNum}.pdf`);
    toast({ title: "Facture téléchargée", description: `${invoiceNum}.pdf` });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fullName = getFullName(profile);
  const totalPaid = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-cours")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{profile?.school_level && getSchoolLevelName(profile.school_level)}</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}><UserIcon className="mr-2 h-4 w-4" /><span>Gérer mon compte</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}><GraduationCap className="mr-2 h-4 w-4" /><span>Tableau de bord</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Se déconnecter</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/account")} className="cursor-pointer flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour vers Gérer mon compte
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Receipt className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Facturation</h1>
              <p className="text-muted-foreground">Historique de vos paiements et factures</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total payé</p>
                    <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Factures</p>
                    <p className="text-xl font-bold">{payments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dernier paiement</p>
                    <p className="text-xl font-bold">
                      {payments.length > 0 ? formatDate(payments[0].payment_date) : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          {payments.length > 0 ? (
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Historique des factures
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="font-semibold">N° Facture</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Formule</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold text-right">Montant</TableHead>
                      <TableHead className="font-semibold text-center">Statut</TableHead>
                      <TableHead className="font-semibold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm font-medium text-primary">
                          {generateInvoiceNumber(payment)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.plan_label}
                        </TableCell>
                        <TableCell>
                          {payment.is_family ? (
                            <span className="text-sm">Famille ({payment.children_count} enfant{payment.children_count > 1 ? "s" : ""})</span>
                          ) : (
                            <span className="text-sm">Individuel</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment)}
                            className="opacity-60 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Receipt className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucune facture</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Vos factures apparaîtront ici après votre premier paiement. Rendez-vous sur la page des abonnements pour commencer.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => navigate("/abonnements")}>
                  Voir les abonnements
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Factures;