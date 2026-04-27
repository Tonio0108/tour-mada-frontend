import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Mail, Phone, MapPin, Send, Facebook, Loader2 } from "lucide-react";
import { MailApi } from "../lib/api";
import { toast } from "sonner";

const ContactSection = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("contact.form.required_fields"));
      return;
    }

    try {
      setLoading(true);
      await MailApi.sendContactEmail(formData);
      toast.success(t("contact.form.success"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error(t("contact.form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("contact.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("contact.call_to_action")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="space-y-4">
            <Card className="border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("contact.phone.title")}</p>
                  <p className="font-semibold text-foreground">{t("contact.phone.value")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("contact.email.title")}</p>
                  <p className="font-semibold text-foreground">{t("contact.email.value")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("contact.address.title")}</p>
                  <p className="font-semibold text-foreground">{t("contact.address.value")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("contact.social.title")}</p>
                  <a href="https://www.facebook.com/rado.tourguida" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary transition-colors">
                    {t("contact.social.facebook")}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2 border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t("contact.buttons.email")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("reservation.placeholders.full_name")} 
                    className="border-input focus-visible:ring-primary h-12" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("reservation.placeholders.email")} 
                    className="border-input focus-visible:ring-primary h-12" 
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Input 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t("contact.form.subject")} 
                    className="border-input focus-visible:ring-primary h-12" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("contact.form.message")} 
                    className="border-input focus-visible:ring-primary min-h-[150px]" 
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={loading} className="w-full md:w-auto px-10 h-12 font-bold gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {t("contact.buttons.email")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;