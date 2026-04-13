import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { 
  Mail, 
  Lock, 
  MapPin, 
  User, 
  Phone, 
  Globe, 
  ArrowLeft, 
  Loader, 
  UserPlus, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { registerSchema } from "@/lib/validations/register";
import { authAPI, setAuthToken } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Madagascar",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const registerData = {
        email: data.email,
        mot_de_passe: data.password,
        type_utilisateur: "CLIENT",
        Clients: {
          nom: data.lastName,
          prenom: data.firstName,
          telephone: data.phone,
          adresse: data.address,
          ville: data.city,
          codepostal: data.postalCode,
          pays: data.country,
          utilisateurId: 0,
        },
      };

      const response = await authAPI.register(registerData);
      await setAuthToken(response.token);
      toast.success(t('register.success_message') || "Compte créé avec succès !");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      if (error.message.includes("email")) {
        form.setError("email", { type: "manual", message: error.message });
      } else {
        toast.error(error.message || t('register.errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-2xl">
        <Card className="p-2 overflow-hidden">
          <CardHeader className="pt-6 pb-4 text-center space-y-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center text-primary-foreground">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-center">{t('register.title')}</CardTitle>
              <CardDescription>
                {t('register.subtitle')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted text-primary flex items-center justify-center font-bold text-xs">01</div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('register.sections.personal')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.personal_info.first_name')}
                            placeholder={t('register.placeholders.first_name')}
                            icon={User}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.personal_info.last_name')}
                            placeholder={t('register.placeholders.last_name')}
                            icon={User}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.personal_info.email')}
                            type="email"
                            placeholder={t('register.placeholders.email')}
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.personal_info.phone')}
                            type="tel"
                            placeholder={t('register.placeholders.phone')}
                            icon={Phone}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted text-primary flex items-center justify-center font-bold text-xs">02</div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('register.sections.address')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              label={t('register.personal_info.address')}
                              placeholder={t('register.placeholders.address')}
                              icon={MapPin}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.personal_info.city')}
                            placeholder={t('register.placeholders.city')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.personal_info.postal_code')}
                            placeholder={t('register.placeholders.postal_code')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              label={t('register.personal_info.country')}
                              placeholder={t('register.placeholders.country')}
                              icon={Globe}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted text-primary flex items-center justify-center font-bold text-xs">03</div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('register.sections.security')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.password.password')}
                            type={showPassword ? "text" : "password"}
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label={t('register.password.confirm_password')}
                            type={showConfirmPassword ? "text" : "password"}
                            icon={ShieldCheck}
                            showPasswordToggle
                            showPassword={showConfirmPassword}
                            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start space-x-3 p-4 rounded border">
                        <FormControl>
                          <Checkbox
                            id="acceptTerms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <label htmlFor="acceptTerms" className="text-sm font-medium text-foreground cursor-pointer leading-none">
                            J'accepte les <Link to="/terms" className="underline">conditions</Link> et <Link to="/privacy" className="underline">politique</Link>
                          </label>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full gap-3"
                >
                  {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <><UserPlus className="w-6 h-6" /> {t('register.submit_button.create_account')}</>}
                </Button>
              </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="px-8 pb-6 flex flex-col space-y-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><Separator /></div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-muted-foreground text-xs uppercase font-medium">{t('register.already_have_account') || "Déjà inscrit ?"}</span>
              </div>
            </div>

            <Link to="/login" className="w-full text-center">
              <Button variant="ghost" className="gap-2">
                {t('register.login_link')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
