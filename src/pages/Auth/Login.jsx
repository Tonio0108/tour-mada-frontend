import { loginSchema } from "@/lib/validations/login";
import { authAPI, setAuthToken } from "@/lib/api";
import { useAuth } from "@src/hooks/useAuth";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Mail, Lock, Loader, ArrowRight, UserCheck } from "lucide-react";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = form.watch("rememberMe");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const credentials = {
        email: data.email,
        mot_de_passe: data.password,
      };

      const response = await authAPI.login(credentials);
      setAuthToken(response.token);
      await login(response.token);
      toast.success(t('login.success_message') || "Connexion réussie !");
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const message = error.message.includes("email") || error.message.includes("mot de passe")
        ? t('login.errors.invalid_credentials')
        : error.message || t('login.errors.generic');
      
      toast.error(message);
      form.setError("root", { type: "manual", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-lg">
        <Card className="p-2 overflow-hidden">
          <CardHeader className="pt-6 pb-4 text-center space-y-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center text-primary-foreground">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-center">{t('login.title')}</CardTitle>
              <CardDescription>
                <Trans 
                  i18nKey="login.create_account_prompt" 
                  components={{
                    link: <Link to="/register" className="underline" />
                  }}
                />
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          label={t('login.email_label')}
                          type="email"
                          placeholder={t('login.email_placeholder')}
                          icon={Mail}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          label={t('login.password_label')}
                          type={showPassword ? "text" : "password"}
                          placeholder={t('login.password_placeholder')}
                          icon={Lock}
                          showPasswordToggle
                          showPassword={showPassword}
                          onTogglePassword={() => setShowPassword(!showPassword)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => form.setValue("rememberMe", checked)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium text-muted-foreground cursor-pointer">{t('login.remember_me')}</Label>
                </div>
                <Link to="/forgot-password" title="Coming soon" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {t('login.forgot_password')}
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className="w-full gap-3"
              >
                {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <><UserCheck className="w-6 h-6" /> {t('login.submit_button')}</>}
              </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="px-8 pb-6 flex flex-col space-y-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><Separator className="bg-border" /></div>
              <div className="relative flex justify-center text-xs uppercase font-medium tracking-widest text-muted-foreground">
                <span className="bg-card px-4">{t('login.first_visit')}</span>
              </div>
            </div>

            <Link to="/register" className="w-full">
              <Button variant="outline" className="w-full">
                {t('login.create_account_button')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

