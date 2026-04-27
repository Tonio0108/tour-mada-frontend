import { getAuthToken, removeAuthToken } from "../lib/api";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import logo from "../src/assets/logo.jpg";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, ChevronDown, Check, LogOut, User, TicketCheck, CreditCard, Settings, Globe, LayoutDashboard, Bell, MessageCircle, MessageSquareText } from "lucide-react";
import { cn } from "../lib/utils";
import { useRole } from "../src/hooks/useRole";
import { useNotifications } from "../src/context/NotificationContext";
import { Badge } from "@/components/ui/badge";
import ChatSidebar from "./ChatSidebar";

const sections = [
  { id: "home", label: "navbar.home" },
  { id: "about", label: "navbar.about" },
  { id: "tour", label: "navbar.tours" },
  { id: "contact", label: "navbar.contact" },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export default function NavBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isClient, isAdmin } = useRole();
  const { unreadNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      setIsSheetOpen(false);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(sectionId);
        setIsSheetOpen(false);
      }
    }
  };

  useEffect(() => {
    // Si on arrive sur la page d'accueil avec un hash, on scrolle vers la section
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          setActiveSection(id);
        }
      }, 100);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) setUser(await res.json());
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    navigate("/");
    window.location.reload();
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-background/80 backdrop-blur-lg py-2 shadow-sm border-border" 
          : "bg-transparent py-4 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-12">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
            <img src={logo} alt="logo" className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-border" />
            <span className="font-bold text-base tracking-tight text-foreground">{t("navbar.brand")}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center bg-muted/50 rounded-full px-2 py-1 mx-4">
            {sections.slice(0, 2).map((s) => (
              <Button
                key={s.id}
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "rounded-full transition-colors font-medium text-sm px-4",
                  activeSection === s.id 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(s.label)}
              </Button>
            ))}

            <Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />

            {sections.slice(2).map((s) => (
              <Button
                key={s.id}
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "rounded-full transition-colors font-medium text-sm px-4",
                  activeSection === s.id 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(s.label)}
              </Button>
            ))}

            <Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(true)}
              className="rounded-full transition-all font-bold text-[10px] uppercase tracking-wider px-3 flex items-center gap-2 text-primary hover:bg-primary/10"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>{t("chat.discussion_center")}</span>
            </Button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button  size="sm" className="h-9 w-12 bg-white text-black gap-1 rounded-full px-0">
                  <span className="text-lg leading-none">{currentLanguage.flag}</span>
                  <ChevronDown className="w-3 h-3 opacity-40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languages.map((l) => (
                  <DropdownMenuItem 
                    key={l.code} 
                    onClick={() => i18n.changeLanguage(l.code)}
                    className="gap-2 cursor-pointer"
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span className="flex-1">{l.name}</span>
                    {i18n.language === l.code && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!loading && (
              user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
                        <MessageCircle className="w-5 h-5" />
                        {/* On pourra ajouter un badge ici plus tard */}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 mt-2">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-sm">{t("chat.title")}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                          onClick={() => navigate(isAdmin ? "/admin/chat" : "/client/chat")}
                        >
                          Tout voir
                        </Button>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto p-8 text-center text-muted-foreground">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">{t("chat.no_messages")}</p>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 border-2 border-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 mt-2">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-sm">{t("notifications.title")}</h3>
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                            onClick={markAllAsRead}
                          >
                            {t("notifications.mark_all_read")}
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {unreadNotifications.length > 0 ? (
                          unreadNotifications.map((n) => (
                            <div 
                              key={n.id_notification} 
                              className={cn(
                                "p-4 border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/50",
                                !n.est_lu && "bg-primary/5"
                              )}
                              onClick={() => {
                                if (!n.est_lu) markAsRead(n.id_notification);
                                if (n.lien) navigate(n.lien);
                              }}
                            >
                              <div className="flex justify-between gap-2 mb-1">
                                <span className={cn("text-sm font-semibold", !n.est_lu && "text-primary")}>
                                  {n.titre}
                                </span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">{t("notifications.no_notifications")}</p>
                          </div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 rounded-full gap-2 pl-2 pr-3 max-w-[200px]">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate text-xs font-medium">{user.email}</span>
                      <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 p-1">
                    {isClient() && (
                      <div className="p-1 space-y-0.5">
                        <DropdownMenuItem onClick={() => navigate("/client")} className="cursor-pointer bg-primary/5 text-primary font-medium">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          <span>{t("client_common.client_space")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/client/profile")} className="cursor-pointer">
                          <User className="w-4 h-4 mr-2 opacity-70" />
                          <span>{t("navbar.profile")}</span>
                        </DropdownMenuItem>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="p-1">
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer bg-primary/5 text-primary font-medium">
                          <Settings className="w-4 h-4 mr-2" />
                          <span>{t("navbar.admin_panel")}</span>
                        </DropdownMenuItem>
                      </div>
                    )}
                    <Separator className="my-1" />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>{t("navbar.logout")}</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="rounded-full px-6 h-9 font-semibold"
                  onClick={() => navigate("/login")}
                >
                  {t("navbar.login")}
                </Button>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
             {!loading && !user && (
                <Button size="sm" className="rounded-full h-8 px-4 text-xs" onClick={() => navigate("/login")}>
                  {t("navbar.login")}
                </Button>
             )}
             
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 text-primary bg-primary/10"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquareText className="w-5 h-5" />
              </Button>
            )}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-100 flex flex-col p-0">
                <SheetHeader className="p-6 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="w-7 h-7 rounded-full" />
                    <span className="text-base font-bold">{t("navbar.brand")}</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                  {/* Nav Links */}
                  <div className="grid gap-1">
                    {sections.map((s) => (
                      <Button 
                        key={s.id} 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start text-base font-medium h-12 px-4",
                          activeSection === s.id ? "bg-primary/5 text-primary" : "text-muted-foreground"
                        )}
                        onClick={() => scrollToSection(s.id)}
                      >
                        {t(s.label)}
                      </Button>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base font-bold h-12 px-4 text-primary bg-primary/5 mt-2 gap-3"
                      onClick={() => { setIsChatOpen(true); setIsSheetOpen(false); }}
                    >
                      <MessageSquareText className="w-5 h-5" />
                      {t("chat.discussion_center")}
                    </Button>
                  </div>

                  <Separator />

                  {/* Language Selection */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground px-4 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-3 h-3" /> {t("navbar.language")}
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {languages.map((l) => (
                        <Button
                          key={l.code}
                          variant="ghost"
                          className={cn(
                            "justify-start gap-3 h-12 px-4 font-normal",
                            i18n.language === l.code ? "bg-muted font-medium" : ""
                          )}
                          onClick={() => i18n.changeLanguage(l.code)}
                        >
                          <span className="text-lg">{l.flag}</span>
                          <span>{l.name}</span>
                          {i18n.language === l.code && <Check className="ml-auto w-4 h-4 text-primary" />}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {user && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground px-4 uppercase tracking-wider">
                          {t("navbar.account")}
                        </p>
                        <div className="grid gap-1">
                          {isClient() && (
                            <>
                              <Button variant="ghost" className="justify-start h-12 px-4 font-medium text-primary bg-primary/5" onClick={() => { navigate("/client"); setIsSheetOpen(false); }}>
                                <LayoutDashboard className="w-5 h-5 mr-3" /> {t("client_common.client_space")}
                              </Button>
                              <Button variant="ghost" className="justify-start h-12 px-4 font-normal text-muted-foreground" onClick={() => { navigate("/client/profile"); setIsSheetOpen(false); }}>
                                <User className="w-5 h-5 mr-3 opacity-70" /> {t("navbar.profile")}
                              </Button>
                            </>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" className="justify-start h-12 px-4 font-medium text-primary bg-primary/5" onClick={() => { navigate("/admin"); setIsSheetOpen(false); }}>
                              <Settings className="w-5 h-5 mr-3" /> {t("navbar.admin_panel")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {user && (
                  <div className="p-4 border-t mt-auto">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 px-4 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-3" /> {t("navbar.logout")}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
      <ChatSidebar 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
        user={user} 
        isAdmin={isAdmin} 
      />
    </header>
  );
}
