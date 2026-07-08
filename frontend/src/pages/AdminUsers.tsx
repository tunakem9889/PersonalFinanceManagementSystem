import { useState } from "react";
import { useAdminUsers, useDeleteAdminUser } from "../hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Users, Trash2, Search, Shield, Mail, Calendar, UserCheck, UserX, Eye } from "lucide-react";
import { cn } from "../utils/cn";

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 rounded-xl border", color)}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAdminUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteAdminUser();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    deleteUser(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const handleImpersonate = (email: string) => {
    localStorage.setItem("impersonatedUser", JSON.stringify({ email }));
    // Force a full reload to apply the global axios interceptor header correctly across all queries
    window.location.href = "/";
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-sm text-muted-foreground">Admin panel – manage all registered users</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold">
          <Shield className="h-3 w-3" />
          ADMIN ONLY
        </div>
      </div>

      {/* Stats Row */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatBadge label="Total Users" value={users.length} color="border-blue-200 bg-blue-50" />
          <StatBadge label="Shown" value={filtered.length} color="border-green-200 bg-green-50" />
          <StatBadge label="Registered Today" value={
            users.filter(u => {
              try { return new Date(u.createdAt).toDateString() === new Date().toDateString(); }
              catch { return false; }
            }).length
          } color="border-purple-200 bg-purple-50" />
        </div>
      )}

      {/* Users Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users
              </CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${users.length} total user(s)`}
              </CardDescription>
            </div>
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse p-3">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-2 bg-muted rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <UserX className="h-10 w-10 opacity-30" />
              <p className="text-sm">{search ? "No users match your search." : "No users found."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">#</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">User</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground hidden md:table-cell">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground hidden lg:table-cell">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined</span>
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((user, idx) => (
                    <tr key={user.id} className="group hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                            {user.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName || "—"}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{user.email}</td>
                      <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell">
                        {user.createdAt ? formatDate(user.createdAt) : "—"}
                      </td>
                      <td className="py-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleImpersonate(user.email)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                            "border border-blue-200 text-blue-600 hover:bg-blue-50"
                          )}
                          title="View Data"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Data
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.fullName)}
                          disabled={isDeleting && deletingId === user.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                            "border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          )}
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isDeleting && deletingId === user.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
        <UserCheck className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium">Admin Actions</p>
          <p className="text-xs mt-0.5 text-amber-700">
            Deleting a user will permanently remove their account and all associated data.
            This page is only visible to users with the <code className="font-mono bg-amber-100 px-1 rounded">ROLE_ADMIN</code> role.
          </p>
        </div>
      </div>
    </div>
  );
}
