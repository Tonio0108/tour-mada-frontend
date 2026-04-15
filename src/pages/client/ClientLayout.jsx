import { Outlet, NavLink, useLocation, useNavigate, Link } from "react-router";
import {
  LayoutDashboard,
  CalendarDays,
  WalletCards,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  Home,
  Map,
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Tableau de bord", href: "/client", icon: LayoutDashboard, end: true },
  { name: "Mes Réservations", href: "/client/reservations", icon: CalendarDays },
  { name: "Mes Paiements", href: "/client/paiements", icon: WalletCards },
  { name: "Mon Profil", href: "/client/profile", icon: UserIcon },
];

export default function ClientLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    const current = navigation.find(item => 
      location.pathname === item.href || 
      (item.href !== "/client" && location.pathname.startsWith(item.href))
    );
    return current ? current.name : "Tableau de bord";
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
    const isActive = item.end 
      ? location.pathname === item.href 
      : location.pathname.startsWith(item.href);

    return (
      <NavLink
        key={item.name}
        to={item.href}
        end={item.end}
        onClick={() => setOpen?.(false)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded transition-all
          ${isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
          ${!expanded && !mobile ? "justify-center px-0" : ""}
        `}
      >
        <item.icon className="shrink-0 w-4 h-4" />
        {(expanded || mobile) && <span className="text-sm font-medium">{item.name}</span>}
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
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Map className="w-5 h-5" />
            </div>
            {isSidebarHovered && (
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">TOUR MADA</span>
                <span className="text-[10px] text-muted-foreground">Espace Client</span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} expanded={isSidebarHovered} />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border overflow-hidden">
          <div className={`flex items-center gap-3 ${!isSidebarHovered ? "justify-center" : ""}`}>
             <img
              src={`https://ui-avatars.com/api/?name=${user?.Clients?.prenom}+${user?.Clients?.nom}&background=auto&color=fff`}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-muted shrink-0"
            />
            {isSidebarHovered && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate">{user?.Clients?.prenom}</span>
                <Badge variant="outline" className="text-[10px] w-fit">Client</Badge>
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
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu de navigation</SheetTitle>
                    <SheetDescription>Accédez aux différentes sections de votre espace client</SheetDescription>
                  </SheetHeader>
                  <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="font-bold">TOUR MADA</span>
                  </div>
                  <nav className="p-4 space-y-1">
                    {navigation.map((item) => (
                      <NavItem key={item.name} item={item} mobile />
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-sm md:text-base font-bold">
                {getTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 text-muted-foreground" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user?.Clients?.prenom}+${user?.Clients?.nom}`}
                      alt="Profile"
                      className="w-full h-full rounded-full"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.Clients?.prenom} {user?.Clients?.nom}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/client/profile">Mon Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/">Retour au Site</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
    </div>
  );
}
