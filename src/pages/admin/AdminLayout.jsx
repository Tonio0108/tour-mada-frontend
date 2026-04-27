import { Outlet, NavLink, useLocation, useNavigate, Link } from "react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Map,
  Users,
  WalletCards,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  Home,
  MessageSquare,
  Globe,
  Check,
  MessageCircle,
  MessageSquareText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAuthToken, removeAuthToken } from "../../../lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "../../context/NotificationContext";
import { cn } from "../../../lib/utils";
import ChatSidebar from "../../../components/ChatSidebar";

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { notifications, unreadNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const mainNavigation = [
    { name: t('admin_dashboard.title'), href: "/admin", icon: LayoutDashboard, end: true },
    { name: t('admin_dashboard.stats.reservations'), href: "/admin/reservations", icon: CalendarDays },
    { name: t('admin_dashboard.quick_actions.view_payments'), href: "/admin/paiements", icon: WalletCards },
    { name: t('admin_dashboard.stats.tours'), href: "/admin/tours", icon: Map },
    { name: t('admin_common.client') + 's', href: "/admin/clients", icon: Users },
    { name: t('tour_details.tabs.reviews'), href: "/admin/avis", icon: MessageSquare },
    { name: t('notifications.title'), href: "/admin/notifications", icon: Bell, isNotificationTrigger: true },
  ];

  const accountNavigation = [
    { name: t('profile.title'), href: "/admin/profile", icon: UserIcon },
    { name: t('navbar.account') + 's', href: "/admin/accounts", icon: Settings },
    { name: t('client_common.back_to_site'), href: "/", icon: Home },
  ];

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    const allNavigation = [...mainNavigation, ...accountNavigation];
    const current = allNavigation.find(item => 
      location.pathname === item.href || 
      (item.href !== "/" && item.href !== "/admin" && location.pathname.startsWith(item.href))
    );
    return current ? current.name : t('admin_dashboard.title');
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = await getAuthToken();
    const url = import.meta.env.VITE_API_URL;
    if (token) {
      try {
        const response = await fetch(`${url}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userProfile = await response.json();
          setUser(userProfile);
        }
      } catch (error) {
        console.error("Erreur de vérification du token:", error);
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await removeAuthToken();
    navigate("/");
  };

  const NavItem = ({ item, mobile = false, setOpen, expanded = true }) => {
    const location = useLocation();
    const { unreadCount } = useNotifications();
    const isActive = item.end 
      ? location.pathname === item.href 
      : location.pathname.startsWith(item.href);

    const isNotification = item.isNotificationTrigger;

    return (
      <NavLink
        key={item.name}
        to={item.href}
        end={item.end}
        onClick={() => setOpen?.(false)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded transition-all relative
          ${isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
          ${!expanded && !mobile ? "justify-center px-0" : ""}
        `}
      >
        <div className="relative">
          <item.icon className="shrink-0 w-4 h-4" />
          {isNotification && unreadCount > 0 && !expanded && !mobile && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-background" />
          )}
        </div>
        {(expanded || mobile) && (
          <div className="flex items-center justify-between flex-1">
            <span className="text-sm font-medium">{item.name}</span>
            {isNotification && unreadCount > 0 && (
              <Badge variant="destructive" className="h-4 min-w-4 flex items-center justify-center p-0 text-[10px] px-1">
                {unreadCount}
              </Badge>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`hidden lg:flex flex-col fixed inset-y-0 border-r border-border bg-card z-20 transition-all duration-300 ${isSidebarHovered ? "w-64" : "w-16"}`}
      >
        <div className="h-16 flex items-center px-4 border-b border-border overflow-hidden">
          <Link to="/admin" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Map className="w-5 h-5" />
            </div>
            {isSidebarHovered && (
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">TOUR MADA</span>
                <span className="text-[10px] text-muted-foreground">Admin</span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem key={item.name} item={item} expanded={isSidebarHovered} />
            ))}
          </nav>

          <Separator className="my-4 opacity-50" />
          
          <nav className="space-y-1">
            {accountNavigation.map((item) => (
              <NavItem key={item.name} item={item} expanded={isSidebarHovered} />
            ))}
            
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded transition-all
                text-destructive hover:bg-destructive/10
                ${!isSidebarHovered ? "justify-center px-0" : ""}
              `}
            >
              <LogOut className="shrink-0 w-4 h-4" />
              {isSidebarHovered && <span className="text-sm font-medium">{t('navbar.logout')}</span>}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-border overflow-hidden">
          <div className={`flex items-center gap-3 ${!isSidebarHovered ? "justify-center" : ""}`}>
             <img
              src={`https://ui-avatars.com/api/?name=${user?.Administrateur?.prenom}+${user?.Administrateur?.nom}&background=auto&color=fff`}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-muted shrink-0"
            />
            {isSidebarHovered && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate">{user?.Administrateur?.prenom}</span>
                <Badge variant="outline" className="text-[10px] w-fit">Admin</Badge>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 lg:ml-16 ${isSidebarHovered ? "lg:ml-64" : "lg:ml-16"} flex flex-col min-h-screen`}>
        {/* Header */}
        <header className="h-16 bg-background border-b border-border sticky top-0 z-10 px-4">
          <div className="h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="font-bold">TOUR MADA</span>
                  </div>
                  <nav className="p-4 space-y-1">
                    {mainNavigation.map((item) => (
                      <NavItem key={item.name} item={item} mobile />
                    ))}
                    <Separator className="my-4" />
                    {accountNavigation.map((item) => (
                      <NavItem key={item.name} item={item} mobile />
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <LogOut className="shrink-0 w-4 h-4" />
                      <span className="text-sm font-medium">{t('navbar.logout')}</span>
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-sm md:text-base font-bold">
                {getTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden md:block text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
                {user?.email}
              </span>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageSquareText className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-12 gap-1 rounded-full px-0">
                      <span className="text-base leading-none">{currentLanguage.flag}</span>
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
                        <span className="flex-1 text-sm">{l.name}</span>
                        {i18n.language === l.code && <Check className="w-4 h-4 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full relative">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0 mt-2">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                          onClick={markAllAsRead}
                        >
                          {t('notifications.mark_all_read')}
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
                              <span className={cn("text-xs font-semibold", !n.est_lu && "text-primary")}>
                                {n.titre}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">{t('notifications.no_notifications')}</p>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>


        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
          <div className="mx-auto w-full max-w-7xl">
             <Outlet />
          </div>
        </div>
      </main>
      <ChatSidebar 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
        user={user} 
        isAdmin={true} 
      />
    </div>
  );
}

export default AdminLayout;
