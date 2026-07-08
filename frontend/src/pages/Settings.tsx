import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { User, Bell, Shield, Palette } from "lucide-react";
import { useProfile, useUpdateProfile, useChangePassword } from "../hooks/useUser";
import { cn } from "../utils/cn";
// @ts-ignore
import { useForm } from "react-hook-form";

type Section = "account" | "appearance" | "notifications" | "security";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>("account");
  
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  
  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      username: "",
      email: "",
    }
  });
  
  const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, watch: watchPassword, formState: { errors: pwdErrors } } = useForm();

  // Initialize form with fetched profile data
  if (profile && !regProfile.name) { // basic check to only reset if we haven't loaded yet
     // Note: A real app might use useEffect to reset form when `profile` loads.
  }

  const user = profile || (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const onUpdateProfile = (data: any) => {
    updateProfile({ username: data.username, email: data.email });
  };

  const onChangePassword = (data: any) => {
    changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword }, {
      onSuccess: () => {
        resetPassword();
        alert("Password changed successfully!");
      },
      onError: () => {
        alert("Failed to change password. Please check your current password.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Settings Navigation */}
        <div className="md:col-span-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeSection === id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-9 space-y-6">
          {activeSection === "account" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your profile details and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                      {(user.username || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{user.username || user.email || "User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <input
                        type="text"
                        {...regProfile("username")}
                        defaultValue={user.username || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input
                        type="email"
                        {...regProfile("email")}
                        defaultValue={user.email || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <button type="submit" disabled={isUpdatingProfile} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2 disabled:opacity-50">
                      {isUpdatingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </CardContent>
              </Card>

            </>
          )}

          {activeSection === "appearance" && (
            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look and feel of the app.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Light", "Dark", "System"].map((t) => (
                      <button key={t} className="p-3 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Configure how you receive alerts.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {["Budget alerts", "Weekly summary", "Transaction reminders", "Unusual spending"].map((item) => (
                  <div key={item} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item}</p>
                      <p className="text-xs text-muted-foreground">Receive a notification when {item.toLowerCase()}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-muted peer-checked:bg-primary rounded-full peer peer-focus:ring-2 peer-focus:ring-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <Card>
              <CardHeader><CardTitle>Security</CardTitle><CardDescription>Manage your password and account security.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <input type="password" {...regPassword("oldPassword", { required: "Required" })} placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    {pwdErrors.oldPassword && <span className="text-xs text-red-500">{pwdErrors.oldPassword.message as string}</span>}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">New Password</label>
                    <input type="password" {...regPassword("newPassword", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    {pwdErrors.newPassword && <span className="text-xs text-red-500">{pwdErrors.newPassword.message as string}</span>}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <input type="password" {...regPassword("confirmPassword", { 
                      required: "Required",
                      validate: (val: string) => val === watchPassword("newPassword") || "Passwords do not match" 
                    })} placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    {pwdErrors.confirmPassword && <span className="text-xs text-red-500">{pwdErrors.confirmPassword.message as string}</span>}
                  </div>
                  <button type="submit" disabled={isChangingPassword} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2 disabled:opacity-50">
                    {isChangingPassword ? "Saving..." : "Change Password"}
                  </button>
                </form>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-destructive">Danger Zone</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">This action cannot be undone.</p>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-destructive text-destructive hover:bg-destructive/10 h-9 px-4 py-2">
                    Delete Account
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
