import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Eye, EyeOff, User } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import iconStudent from "@/assets/icon-student.png";
import iconParent from "@/assets/icon-parent.png";
import LocationFields from "@/components/profile/LocationFields";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [profileType, setProfileType] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [filiere, setFiliere] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [wilaya, setWilaya] = useState("");
  const [ville, setVille] = useState("");
  const [phone, setPhone] = useState("");
  const [ecole, setEcole] = useState("");

  // RGPD Consent states
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentTermsPrivacy, setConsentTermsPrivacy] = useState(false);
  const [consentParental, setConsentParental] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Capturer le code de parrainage depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Stocker dans sessionStorage pour le conserver
      sessionStorage.setItem('referralCode', refCode);
    } else {
      // Vérifier si on a un code en sessionStorage
      const storedCode = sessionStorage.getItem('referralCode');
      if (storedCode) {
        setReferralCode(storedCode);
      }
    }

    const mode = params.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          // Check user role to redirect appropriately
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .limit(1)
            .maybeSingle();

          // Pour les nouveaux utilisateurs (sans rôle) ou élèves, vérifier s'ils ont un style d'apprentissage
          if (!roleData?.role || roleData?.role === 'student') {
            const { data: styleData } = await supabase
              .from('student_scores')
              .select('id')
              .eq('user_id', session.user.id)
              .is('lesson_id', null)
              .maybeSingle();
            if (!styleData) {
              // Ne pas rediriger, laisser l'évaluation s'afficher
              return;
            }
          }

          setTimeout(() => {
            if (roleData?.role === 'parent') {
              navigate("/parent-dashboard");
            } else if (roleData?.role === 'admin') {
              navigate("/dashboard");
            } else {
              navigate("/liste-cours");
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Check user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();

        // Si élève, vérifier s'il a déjà un style d'apprentissage
        if (roleData?.role === 'student') {
          const { data: styleData } = await supabase
            .from('student_scores')
            .select('id')
            .eq('user_id', session.user.id)
            .is('lesson_id', null)
            .maybeSingle();
          if (!styleData) {
            // Ne pas rediriger, laisser l'évaluation s'afficher
            return;
          }
        }

        if (roleData?.role === 'parent') {
          navigate("/parent-dashboard");
        } else if (roleData?.role === 'admin') {
          navigate("/dashboard");
        } else {
          navigate("/liste-cours");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule.";
    }
    if (!/\d/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre.";
    }
    return null;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validation pour l'inscription
    if (!isLogin) {
      if (!firstName || !lastName || !email || !password || !profileType) {
        toast.error("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }

      if (profileType === 'enfant' && !classLevel) {
        toast.error("Veuillez sélectionner votre classe.");
        return;
      }

      const needsFiliere = ["Terminale", "Seconde", "Première"].includes(classLevel);
      if (profileType === 'enfant' && needsFiliere && !filiere) {
        toast.error("Veuillez sélectionner votre filière.");
        return;
      }

      if (!consentDataProcessing || !consentTermsPrivacy) {
        toast.error("Vous devez accepter le traitement des données et la politique de confidentialité pour vous inscrire.");
        return;
      }

      if (dateOfBirth) {
        const age = new Date().getFullYear() - dateOfBirth.getFullYear();
        if (age < 15 && !consentParental) {
          toast.error("Le consentement parental est requis pour les utilisateurs de moins de 15 ans.");
          return;
        }
      }

      // ✅ AFFICHER L'OVERLAY IMMÉDIATEMENT - SANS ATTENDRE LE SERVEUR
      setIsRegistering(true);

      // Envoyer l'inscription en arrière-plan
      performSignUp(firstName, lastName, email, password, profileType, classLevel, filiere, dateOfBirth, wilaya, ville, ecole, phone);
    } else {
      // LOGIN
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Connexion réussie !");
      } catch (error: any) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Veuillez d'abord confirmer votre email en cliquant sur le lien envoyé dans votre boîte de réception.", {
            duration: 6000,
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou mot de passe incorrect.");
        } else if (error.message.includes("User already registered")) {
          toast.error("Un compte existe déjà avec cet email.");
        } else {
          toast.error(error.message || "Une erreur s'est produite.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const performSignUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profileType: string,
    classLevel: string,
    filiere: string,
    dateOfBirth: Date | undefined,
    wilaya: string,
    ville: string,
    ecole: string,
    phone: string
  ) => {
    try {
      const schoolLevelMapping: Record<string, string> = {
        "5ème Primaire": "5eme_primaire",
        "1ère CEM": "1ere_cem",
        "2ème CEM": "2eme_cem",
        "3ème CEM": "3eme_cem",
        "4ème CEM": "4eme_cem",
        "Première": "premiere",
        "Seconde": "seconde",
        "Terminale": "terminale",
      };

      const userData: any = {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: profileType === 'enfant' ? 'student' : 'parent',
      };

      if (dateOfBirth) {
        userData.date_of_birth = format(dateOfBirth, 'yyyy-MM-dd');
      }

      if (profileType === 'enfant' && classLevel) {
        userData.school_level = schoolLevelMapping[classLevel] || classLevel.toLowerCase();

        if (filiere) {
          const filiereMapping: Record<string, string> = {
            "Tronc commun scientifique": "tronc_commun_scientifique",
            "Tronc commun lettres": "tronc_commun_lettres",
            "Sciences": "sciences",
            "Lettres": "lettres",
            "Gestion": "gestion",
            "Math techniques": "math_techniques",
            "Mathématiques": "mathematiques",
          };
          userData.filiere = filiereMapping[filiere] || filiere.toLowerCase().replace(/\s+/g, '_');
        }
      }

      if (wilaya) userData.wilaya = wilaya;
      if (ville) userData.ville = ville;
      if (ecole) userData.ecole = ecole;
      if (phone) userData.phone = phone;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: userData,
        },
      });

      if (error) throw error;
      setRegistrationEmail(email);
      // Naviguer vers l'évaluation d'apprentissage APRÈS que le signup soit réussi
      navigate('/learning-assessment');
    } catch (error: any) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Veuillez d'abord confirmer votre email en cliquant sur le lien envoyé dans votre boîte de réception.", {
          duration: 6000,
        });
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect.");
      } else if (error.message.includes("User already registered")) {
        toast.error("Un compte existe déjà avec cet email.");
      } else {
        toast.error(error.message || "Une erreur s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/liste-cours`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion avec Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) throw error;
      toast.success("Email de réinitialisation envoyé !");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setLoading(false);
    }
  };

  // Ne pas masquer l'interface si on est sur /learning-assessment, /complete-profile, ou pendant l'inscription
  const isOnboardingOrAssessment = ["/learning-assessment", "/complete-profile"].some((path) => window.location.pathname.startsWith(path));

  // ⚠️ IMPORTANT: Ne PAS retourner null pendant l'inscription (isRegistering)
  // car la session Supabase est créée AVANT la navigation vers /learning-assessment
  // ce qui causait une page blanche entre les deux
  if (session && !isOnboardingOrAssessment && !isRegistering) {
    return null;
  }

  // Écran de chargement pendant l'inscription en cours
  if (isRegistering) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary to-background gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/10" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Création de votre compte...</h2>
          <p className="text-muted-foreground text-sm">Préparation de votre test de niveau</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header minimal={true} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4 pt-24">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 border border-border">
            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-foreground mb-8">
              {showForgotPassword ? "Mot de passe oublié" : isLogin ? "Connecte-toi !" : "Inscription"}
            </h1>

            {showForgotPassword ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/20 border-border"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Entrez l'adresse e-mail avec laquelle vous vous êtes inscrit. Nous allons vous envoyer un e-mail avec votre nom d'utilisateur et un lien pour réinitialiser votre mot de passe.
                  </p>
                  <p className="text-sm font-medium text-warning mt-2">
                    ⚠️ Ce lien expirera dans 1 heure.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-primary" disabled={loading}>
                  {loading ? "Envoi..." : "Réinitialiser le mot de passe"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Retour à la connexion
                </Button>
              </form>
            ) : (
              <>
                {!isLogin && (
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="space-y-3 mb-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full justify-start"
                      >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC04"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#4285F4"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continuer avec Google
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-card px-3 text-muted-foreground">OU</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Prénom"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setTouched(prev => ({ ...prev, firstName: true }));
                          }}
                          onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                          className={cn(
                            "bg-secondary/20 pl-10",
                            (submitted || touched.firstName) && !firstName ? "border-red-500 border-2" : "border-border"
                          )}
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Nom"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setTouched(prev => ({ ...prev, lastName: true }));
                          }}
                          onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
                          className={cn(
                            "bg-secondary/20 pl-10",
                            (submitted || touched.lastName) && !lastName ? "border-red-500 border-2" : "border-border"
                          )}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Date de naissance</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-secondary/20",
                              !dateOfBirth && "text-muted-foreground",
                              (submitted || touched.dateOfBirth) && !dateOfBirth ? "border-red-500 border-2" : "border-border"
                            )}
                          >
                            {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "Sélectionnez votre date de naissance"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={(date) => {
                              setDateOfBirth(date);
                              setTouched(prev => ({ ...prev, dateOfBirth: true }));
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Input
                      type="tel"
                      placeholder="Numéro de téléphone (ex: 0555 123 456)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-secondary/20 border-border"
                    />

                    <Input
                      type="email"
                      placeholder="Adresse e-mail"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setTouched(prev => ({ ...prev, email: true }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                      className={cn(
                        "bg-secondary/20",
                        (submitted || touched.email) && !email ? "border-red-500 border-2" : "border-border"
                      )}
                      required
                    />

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setTouched(prev => ({ ...prev, password: true }));
                        }}
                        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                        className={cn(
                          "bg-secondary/20 pr-10",
                          (submitted || touched.password) && !password ? "border-red-500 border-2" : "border-border"
                        )}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Qui es-tu ?</Label>
                      <RadioGroup
                        value={profileType}
                        onValueChange={(value) => {
                          setProfileType(value);
                          setTouched(prev => ({ ...prev, profileType: true }));
                        }}
                        required
                      >
                        <div className={cn(
                          "grid grid-cols-2 gap-4 p-1 rounded-lg",
                          (submitted || touched.profileType) && !profileType ? "ring-2 ring-red-500" : ""
                        )}>
                          <Label
                            htmlFor="enfant"
                            className={cn(
                              "flex flex-col items-center justify-center h-32 px-4 rounded-lg border-2 cursor-pointer transition-all",
                              profileType === "enfant"
                                ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                : "bg-secondary/20 border-border hover:bg-secondary/30"
                            )}
                          >
                            <RadioGroupItem value="enfant" id="enfant" className="sr-only" />
                            <img src={iconStudent} alt="Élève" className="h-20 w-20 mb-2 object-contain" />
                            <span className="font-semibold">Élève</span>
                          </Label>
                          <Label
                            htmlFor="parent"
                            className={cn(
                              "flex flex-col items-center justify-center h-32 px-4 rounded-lg border-2 cursor-pointer transition-all",
                              profileType === "parent"
                                ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                : "bg-secondary/20 border-border hover:bg-secondary/30"
                            )}
                          >
                            <RadioGroupItem value="parent" id="parent" className="sr-only" />
                            <img src={iconParent} alt="Parent" className="h-20 w-20 mb-2 object-contain" />
                            <span className="font-semibold">Parent</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {profileType === "enfant" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">En quelle classe es-tu ?</Label>
                          <RadioGroup
                            value={classLevel}
                            onValueChange={(value) => {
                              setClassLevel(value);
                              setFiliere(""); // Reset filière when class changes
                              setTouched(prev => ({ ...prev, classLevel: true, filiere: false }));
                            }}
                            required
                          >
                            <div className={cn(
                              "grid grid-cols-2 gap-3 p-1 rounded-lg",
                              (submitted || touched.classLevel) && !classLevel && profileType === "enfant" ? "ring-2 ring-red-500" : ""
                            )}>
                              {["5ème Primaire", "1ère CEM", "2ème CEM", "3ème CEM", "4ème CEM", "Première", "Seconde", "Terminale"].map((level) => (
                                <Label
                                  key={level}
                                  htmlFor={level}
                                  className={cn(
                                    "flex items-center justify-center h-10 px-4 rounded-md border-2 cursor-pointer transition-all font-medium",
                                    classLevel === level
                                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                                      : "bg-secondary/20 border-border hover:bg-secondary/30 hover:border-primary"
                                  )}
                                >
                                  <RadioGroupItem value={level} id={level} className="sr-only" />
                                  {level}
                                </Label>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Filières pour Terminale et Seconde */}
                        {(classLevel === "Terminale" || classLevel === "Seconde") && (
                          <div className="space-y-2">
                            <Label className="text-foreground">Quelle est ta filière ?</Label>
                            <RadioGroup
                              value={filiere}
                              onValueChange={(value) => {
                                setFiliere(value);
                                setTouched(prev => ({ ...prev, filiere: true }));
                              }}
                              required
                            >
                              <div className={cn(
                                "grid grid-cols-2 gap-3 p-1 rounded-lg",
                                (submitted || touched.filiere) && !filiere ? "ring-2 ring-red-500" : ""
                              )}>
                                {["Sciences", "Lettres", "Gestion", "Math techniques", "Mathématiques"].map((f) => (
                                  <Label
                                    key={f}
                                    htmlFor={`filiere-${f}`}
                                    className={cn(
                                      "flex items-center justify-center h-10 px-4 rounded-md border-2 cursor-pointer transition-all font-medium text-sm",
                                      filiere === f
                                        ? "bg-accent text-accent-foreground border-accent shadow-md"
                                        : "bg-secondary/20 border-border hover:bg-secondary/30 hover:border-accent"
                                    )}
                                  >
                                    <RadioGroupItem value={f} id={`filiere-${f}`} className="sr-only" />
                                    {f}
                                  </Label>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        {/* Filières pour Première (tronc commun) */}
                        {classLevel === "Première" && (
                          <div className="space-y-2">
                            <Label className="text-foreground">Quel est ton tronc commun ?</Label>
                            <RadioGroup
                              value={filiere}
                              onValueChange={(value) => {
                                setFiliere(value);
                                setTouched(prev => ({ ...prev, filiere: true }));
                              }}
                              required
                            >
                              <div className={cn(
                                "grid grid-cols-2 gap-3 p-1 rounded-lg",
                                (submitted || touched.filiere) && !filiere ? "ring-2 ring-red-500" : ""
                              )}>
                                {["Tronc commun scientifique", "Tronc commun lettres"].map((f) => (
                                  <Label
                                    key={f}
                                    htmlFor={`filiere-${f}`}
                                    className={cn(
                                      "flex items-center justify-center h-10 px-4 rounded-md border-2 cursor-pointer transition-all font-medium text-sm",
                                      filiere === f
                                        ? "bg-accent text-accent-foreground border-accent shadow-md"
                                        : "bg-secondary/20 border-border hover:bg-secondary/30 hover:border-accent"
                                    )}
                                  >
                                    <RadioGroupItem value={f} id={`filiere-${f}`} className="sr-only" />
                                    {f}
                                  </Label>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Wilaya, Ville, École - toujours affiché */}
                    <LocationFields
                      wilaya={wilaya}
                      ville={ville}
                      ecole={ecole}
                      onWilayaChange={setWilaya}
                      onVilleChange={setVille}
                      onEcoleChange={setEcole}
                    />

                    {/* RGPD Consents */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="consentDataProcessing"
                          checked={consentDataProcessing}
                          onCheckedChange={(checked) => setConsentDataProcessing(checked as boolean)}
                          className="mt-1"
                        />
                        <label
                          htmlFor="consentDataProcessing"
                          className="text-sm text-foreground cursor-pointer leading-relaxed"
                        >
                          <span className="text-red-500">*</span> J'accepte le traitement de mes données personnelles conformément au RGPD
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="consentTermsPrivacy"
                          checked={consentTermsPrivacy}
                          onCheckedChange={(checked) => setConsentTermsPrivacy(checked as boolean)}
                          className="mt-1"
                        />
                        <label
                          htmlFor="consentTermsPrivacy"
                          className="text-sm text-foreground cursor-pointer leading-relaxed"
                        >
                          <span className="text-red-500">*</span> J'accepte les{" "}
                          <a
                            href="/mentions-legales"
                            target="_blank"
                            className="text-primary hover:underline font-medium"
                          >
                            Conditions Générales d'Utilisation
                          </a>
                          {" "}et la{" "}
                          <a
                            href="/politique-confidentialite"
                            target="_blank"
                            className="text-primary hover:underline font-medium"
                          >
                            Politique de Confidentialité
                          </a>
                        </label>
                      </div>

                      {dateOfBirth && new Date().getFullYear() - dateOfBirth.getFullYear() < 15 && (
                        <div className="flex items-start space-x-3 bg-accent/10 p-3 rounded-lg">
                          <Checkbox
                            id="consentParental"
                            checked={consentParental}
                            onCheckedChange={(checked) => setConsentParental(checked as boolean)}
                            className="mt-1"
                          />
                          <label
                            htmlFor="consentParental"
                            className="text-sm text-foreground cursor-pointer leading-relaxed"
                          >
                            <span className="text-red-500">*</span> Je certifie que mes parents/tuteurs légaux consentent à mon inscription et au traitement de mes données personnelles (requis pour les mineurs de moins de 15 ans)
                          </label>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        <span className="text-red-500">*</span> Champs obligatoires.
                        Pour en savoir plus sur la protection de vos données, consultez notre{" "}
                        <a
                          href="/politique-confidentialite"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Politique de Confidentialité
                        </a>.
                      </p>
                    </div>

                    <Button type="submit" className="w-full bg-primary" disabled={loading}>
                      {loading ? "Chargement..." : "S'inscrire"}
                    </Button>
                  </form>
                )}

                {isLogin && (
                  <>
                    {/* Social Login Buttons */}
                    <div className="space-y-3 mb-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full justify-start"
                      >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC04"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#4285F4"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Se connecter avec Google
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-card px-3 text-muted-foreground">OU</span>
                      </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary/20 border-border"
                        required
                      />

                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-secondary/20 border-border pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-foreground cursor-pointer"
                          >
                            Se souvenir de moi
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <Button type="submit" className="w-full bg-primary" disabled={loading}>
                        {loading ? "Chargement..." : "Se connecter"}
                      </Button>
                    </form>
                  </>
                )}

                {/* Toggle Login/Signup */}
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-foreground"
                  >
                    {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
                    <span className="text-primary hover:underline font-medium">
                      {isLogin ? "Inscris-toi" : "Connecte-toi"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
