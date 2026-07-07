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
    return amount.toString() + 'DA';
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
    const invoiceNum = generateInvoiceNumber(payment);
    const typeLabel = payment.is_family
      ? `Famille (${payment.children_count} enfant${payment.children_count > 1 ? "s" : ""})`
      : "Individuel";
    const statusText = payment.status === "completed" ? "PAYÉ" : "EN ATTENTE";
    const statusColor = payment.status === "completed" ? "#16a34a" : "#a16207";
    const statusBg = payment.status === "completed" ? "#dcfce7" : "#fef9c3";
    const userName = getFullName(profile);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Erreur", description: "Veuillez autoriser les pop-ups pour télécharger la facture", variant: "destructive" });
      return;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Facture ${invoiceNum}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; padding: 40px; color: #0f172a; }
      .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .logo { width: 48px; height: 48px; background: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
      .brand-name { font-size: 24px; font-weight: bold; }
      .brand-name span { color: #4f46e5; }
      .badge { background: #4f46e5; color: white; padding: 8px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; }
      .meta { text-align: right; color: #64748b; font-size: 12px; margin-top: 8px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
      .info-box { padding: 16px; border-radius: 8px; }
      .info-box.left { background: #f1f5f9; }
      .info-box.right { background: #eef2ff; }
      .info-label { font-size: 10px; font-weight: bold; color: #4f46e5; text-transform: uppercase; margin-bottom: 8px; }
      .info-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
      .info-email { font-size: 12px; color: #64748b; }
      table { width: 100%; border-collapse: collapse; margin: 24px 0; }
      thead th { background: #0f172a; color: white; padding: 10px 16px; font-size: 11px; text-align: left; }
      thead th:last-child { text-align: right; }
      thead th:nth-child(2) { text-align: center; }
      tbody td { padding: 12px 16px; background: #f1f5f9; font-size: 13px; }
      tbody td:last-child { text-align: right; font-weight: bold; }
      tbody td:nth-child(2) { text-align: center; color: #64748b; }
      .totals { display: flex; justify-content: flex-end; margin: 16px 0; }
      .totals-box { min-width: 240px; }
      .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; }
      .total-final { display: flex; justify-content: space-between; background: #4f46e5; color: white; padding: 12px 16px; border-radius: 6px; font-weight: bold; font-size: 16px; margin-top: 8px; }
      .status { display: inline-block; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; border: 2px solid; }
      .thanks { background: #eef2ff; padding: 20px; border-radius: 8px; text-align: center; margin: 32px 0; }
      .thanks h3 { color: #4f46e5; font-size: 16px; margin-bottom: 6px; }
      .thanks p { color: #64748b; font-size: 12px; }
      .footer { background: #0f172a; color: #b4bed2; padding: 16px; text-align: center; font-size: 10px; border-radius: 0 0 8px 8px; position: fixed; bottom: 0; left: 0; right: 0; }
      @media print { body { padding: 20px; } .footer { position: fixed; } }
    </style></head><body>
      <div class="header">
        <div>
          <div class="brand"><div class="logo">A+</div><div class="brand-name">Academie<span>Plus</span></div></div>
          <p style="font-size:11px;color:#64748b;margin-top:4px;margin-left:60px">Votre partenaire éducatif de confiance</p>
        </div>
        <div>
          <div class="badge">FACTURE</div>
          <div class="meta"><p>N° ${invoiceNum}</p><p>Date : ${formatDateTimeFull(payment.payment_date)}</p></div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-box left">
          <div class="info-label">Facturé à</div>
          <div class="info-name">${userName}</div>
          <div class="info-email">${profile?.email || "—"}</div>
        </div>
        <div class="info-box right">
          <div class="info-label">Détails de facturation</div>
          <p style="font-size:12px;margin-top:4px">Type : ${typeLabel}</p>
          <p style="font-size:12px">Formule : ${payment.plan_label}</p>
        </div>
      </div>
      <table><thead><tr><th>DESCRIPTION</th><th>QTÉ</th><th>MONTANT</th></tr></thead>
      <tbody><tr><td>${payment.plan_label}</td><td>1</td><td>${formatCurrency(payment.amount)}</td></tr></tbody></table>
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div class="status" style="color:${statusColor};background:${statusBg};border-color:${statusColor}">${statusText}</div>
        <div class="totals-box">
          <div class="total-row"><span>Sous-total</span><span style="color:#0f172a">${formatCurrency(payment.amount)}</span></div>
          <div class="total-final"><span>TOTAL TTC</span><span>${formatCurrency(payment.amount)}</span></div>
        </div>
      </div>
      <div class="thanks"><h3>Merci pour votre confiance !</h3><p>Pour toute question, contactez-nous à support@academieplus.dz</p></div>
      <div class="footer"><p>AcadémiePlus - Votre partenaire éducatif de confiance</p><p>www.academieplus.dz | contact@academieplus.dz</p></div>
      <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
    printWindow.document.close();
    toast({ title: "Facture prête", description: `${invoiceNum} - utilisez Ctrl+P pour enregistrer en PDF` });
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
    <div className="min-h-screen pro-shell">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-cours")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-extrabold">AcadémiePlus</span>
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
            <div className="h-14 w-14 rounded-2xl bg-[image:var(--gradient-violet)] flex items-center justify-center shadow-md">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold">Facturation</h1>
              <p className="text-muted-foreground">Historique de vos paiements et factures</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 text-white" style={{ background: "linear-gradient(135deg, hsl(213 56% 16%), hsl(212 55% 28%))" }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Total payé</p>
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
            <Card className="pro-card overflow-hidden">
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
