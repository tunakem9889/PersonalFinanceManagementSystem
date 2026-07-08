import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Wallet, BarChart3, Settings, ShieldCheck, Tag } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuthState } from '../utils/auth';

const userNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/budgets', icon: PieChart, label: 'Budgets' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/wallets', icon: Wallet, label: 'Wallets' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { to: '/admin/users', icon: ShieldCheck, label: 'User Management' },
];

export default function MainLayout() {
  const { isAdmin, username, email } = useAuthState();

  const displayName = username || email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 font-semibold gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <span>Finance System</span>
          {isAdmin && (
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">
              ADMIN
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            {/* User nav items */}
            {userNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}

            {/* Admin section – only for admins */}
            {isAdmin && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Administration
                  </p>
                </div>
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-amber-700",
                        isActive
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "text-muted-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Bottom user info */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {isAdmin && (
                <p className="text-xs text-amber-600 font-medium">Administrator</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 shrink-0">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">
              Welcome back, {displayName.split(" ")[0]}!
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
                    isActive
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "text-amber-700 hover:bg-amber-50 border border-amber-200"
                  )
                }
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Panel
              </NavLink>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("impersonatedUser");
                window.location.href = "/login";
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto flex flex-col">
          {(() => {
            const impersonatedStr = localStorage.getItem("impersonatedUser");
            if (!impersonatedStr) return null;
            try {
              const impersonatedUser = JSON.parse(impersonatedStr);
              return (
                <div className="bg-amber-500 text-amber-950 px-6 py-2 flex items-center justify-between text-sm shadow-sm z-10 shrink-0">
                  <div className="flex items-center gap-2 font-medium">
                    <span>⚠️ Impersonation Mode:</span>
                    <span className="opacity-90 font-normal">You are viewing data as <strong>{impersonatedUser.email}</strong>. Modifications are disabled.</span>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("impersonatedUser");
                      window.location.href = "/admin/users";
                    }}
                    className="bg-amber-950/10 hover:bg-amber-950/20 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                  >
                    Exit Impersonation
                  </button>
                </div>
              );
            } catch {
              return null;
            }
          })()}
          <div className="p-6 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
