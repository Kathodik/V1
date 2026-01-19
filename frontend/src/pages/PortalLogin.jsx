import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const PortalLogin = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast.success('Erfolgreich angemeldet!');
      navigate('/portal');
    } else {
      toast.error(result.error || 'Anmeldung fehlgeschlagen');
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    // Validate name
    if (registerData.name.trim().length < 2) {
      toast.error('Name muss mindestens 2 Zeichen lang sein');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    if (registerData.password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(registerData.password);
    const hasLowerCase = /[a-z]/.test(registerData.password);
    const hasNumbers = /\d/.test(registerData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error('Passwort muss Groß- und Kleinbuchstaben sowie Zahlen enthalten');
      return;
    }

    setLoading(true);

    const result = await register(
      registerData.email,
      registerData.password,
      registerData.name,
      registerData.phone
    );
    
    if (result.success) {
      toast.success('Erfolgreich registriert! Willkommen bei Kathodik.');
      navigate('/portal');
    } else {
      toast.error(result.error || 'Registrierung fehlgeschlagen');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-20 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/4mzqxaj5_A80F545A-F543-476F-BF3A-7169BDADA022.png" 
              alt="Kathodik" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Kundenportal</h1>
            <p className="text-slate-600">Verwalten Sie Ihre Aufträge und Anfragen</p>
          </div>

          <Card className="bg-white border-slate-300">
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Anmelden</TabsTrigger>
                  <TabsTrigger value="register">Registrieren</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email" className="text-slate-800 mb-2 block">
                        E-Mail *
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="ihre@email.de"
                        className="bg-white border-slate-300"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password" className="text-slate-800 mb-2 block">
                        Passwort *
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className="bg-white border-slate-300"
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Anmelden...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Anmelden
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name" className="text-slate-800 mb-2 block">
                        Name *
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Max Mustermann"
                        className="bg-white border-slate-300"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-email" className="text-slate-800 mb-2 block">
                        E-Mail *
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="ihre@email.de"
                        className="bg-white border-slate-300"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-phone" className="text-slate-800 mb-2 block">
                        Telefon (optional)
                      </Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        placeholder="0123 456789"
                        className="bg-white border-slate-300"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-password" className="text-slate-800 mb-2 block">
                        Passwort * (min. 6 Zeichen)
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="••••••••"
                        className="bg-white border-slate-300"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-confirm-password" className="text-slate-800 mb-2 block">
                        Passwort bestätigen *
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="bg-white border-slate-300"
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Registrieren...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5 mr-2" />
                          Registrieren
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-[#2c7a7b]"
            >
              ← Zurück zur Startseite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
