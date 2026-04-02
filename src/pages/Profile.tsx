import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { SchoolLevelSelect } from "@/components/profile/SchoolLevelSelect";
import { LinkedChildrenSection } from "@/components/profile/LinkedChildrenSection";
import { LinkedParentsSection } from "@/components/profile/LinkedParentsSection";
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Phone, 
  Mail, 
  Loader2,
  Save,
  LogOut,
  Shield
} from "lucide-react";
import { getSchoolLevelLabel, getSchoolCategory } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, hasRole } = useAuth();
  const { profile, loading, saving, updateProfile, uploadAvatar } = useProfile();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setSchoolLevel(profile.school_level || "");
    }
  }, [profile]);

  useEffect(() => {
    const checkRoles = async () => {
      const [studentResult, parentResult, adminResult] = await Promise.all([
        hasRole("student"),
        hasRole("parent"),
        hasRole("admin")
      ]);
      setIsStudent(studentResult);
      setIsParent(parentResult);
      setIsAdmin(adminResult);
    };
    if (user) {
      checkRoles();
    }
  }, [user, hasRole]);

  useEffect(() => {
    if (profile) {
      const changed = 
        firstName !== (profile.first_name || "") ||
        lastName !== (profile.last_name || "") ||
        phone !== (profile.phone || "") ||
        schoolLevel !== (profile.school_level || "");
      setHasChanges(changed);
    }
  }, [firstName, lastName, phone, schoolLevel, profile]);

  const handleSave = async () => {
    const updates: Record<string, unknown> = {
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
    };

    if (isStudent) {
      updates.school_level = schoolLevel || null;
    }

    const success = await updateProfile(updates as any);
    if (success) {
      setHasChanges(false);
    }
  };

  const getFullName = () => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Mon profil";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Administration
                </Button>
              )}
              <Button
                variant="outline"
                onClick={signOut}
                className="flex items-center gap-2 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <ProfilePhotoUpload
            currentUrl={profile.avatar_url}
            name={getFullName()}
            onUpload={uploadAvatar}
          />
          <h1 className="text-3xl font-bold mt-4">
            {getFullName()}
          </h1>
          <p className="text-muted-foreground">
            {isStudent && schoolLevel && (
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {getSchoolLevelLabel(schoolLevel)} • {getSchoolCategory(schoolLevel)}
              </span>
            )}
            {isParent && "Compte Parent"}
            {isAdmin && "Administrateur"}
          </p>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations
            </TabsTrigger>
            {isParent && (
              <TabsTrigger value="children" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Mes enfants
              </TabsTrigger>
            )}
            {isStudent && (
              <TabsTrigger value="parents" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Mes parents
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    L'email ne peut pas être modifié directement
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                  />
                </div>

                {isStudent && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Niveau scolaire
                    </Label>
                    <SchoolLevelSelect
                      value={schoolLevel}
                      onValueChange={setSchoolLevel}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (profile) {
                        setFirstName(profile.first_name || "");
                        setLastName(profile.last_name || "");
                        setPhone(profile.phone || "");
                        setSchoolLevel(profile.school_level || "");
                      }
                    }}
                    disabled={!hasChanges || saving}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isParent && (
            <TabsContent value="children">
              <LinkedChildrenSection />
            </TabsContent>
          )}

          {isStudent && (
            <TabsContent value="parents">
              <LinkedParentsSection />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}