import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Plus, Pencil, Trash2, X, Check, Tag } from "lucide-react";
import { cn } from "../utils/cn";
// @ts-ignore
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  type: "income" | "expense";
  icon: string;
};

const ICON_OPTIONS = [
  "🍔", "🍕", "☕", "🛒", "🏠", "🚗", "✈️", "💊", "📚", "🎬",
  "🎮", "👕", "💄", "🐾", "💪", "⚡", "📱", "💡", "🎓", "🏥",
  "💰", "📈", "💼", "🎁", "🍺", "🛠️", "🌿", "🚌", "🚿", "🎵",
];

function CategoryBadge({ type }: { type: string }) {
  const isIncome = type === "income" || type === "INCOME";
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
      isIncome
        ? "bg-green-100 text-green-700 border border-green-200"
        : "bg-red-100 text-red-700 border border-red-200"
    )}>
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedIcon, setSelectedIcon] = useState("🏷️");
  const [editIcon, setEditIcon] = useState("🏷️");

  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: { type: "expense", icon: "🏷️" },
  });
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<FormData>();

  const transactionType = watch("type");

  const filtered = categories.filter((c) => {
    if (filterType === "all") return true;
    return c.type === filterType;
  });

  const incomeCount = categories.filter((c) => c.type === "income").length;
  const expenseCount = categories.filter((c) => c.type === "expense").length;

  const onSubmit = (data: FormData) => {
    createCategory(
      { name: data.name, type: data.type, icon: selectedIcon },
      {
        onSuccess: () => {
          reset();
          setSelectedIcon("🏷️");
          setShowForm(false);
        },
      }
    );
  };

  const onEdit = (data: FormData) => {
    if (!editingId) return;
    updateCategory(
      { id: editingId, data: { name: data.name, type: data.type, icon: editIcon } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditIcon(cat.icon ?? "🏷️");
    resetEdit({ name: cat.name, type: cat.type, icon: cat.icon });
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    deleteCategory(id);
  };

  const inputCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const selectCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <p className="text-sm text-muted-foreground">Manage your income and expense categories</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Category"}
        </button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "All", value: categories.length, active: filterType === "all", key: "all" },
            { label: "Income", value: incomeCount, active: filterType === "income", key: "income" },
            { label: "Expense", value: expenseCount, active: filterType === "expense", key: "expense" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilterType(s.key as any)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                s.active
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-input hover:bg-muted/50"
              )}
            >
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Category</CardTitle>
            <CardDescription>Categories help you organize your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Type toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["expense", "income"] as const).map((t) => (
                    <label
                      key={t}
                      className={cn(
                        "flex items-center justify-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors text-sm font-medium",
                        transactionType === t
                          ? t === "expense"
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "bg-green-50 border-green-300 text-green-700"
                          : "border-input hover:bg-muted"
                      )}
                    >
                      <input type="radio" {...register("type")} value={t} className="sr-only" />
                      {t === "expense" ? "💸 Expense" : "💰 Income"}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <input
                    {...register("name", { required: true })}
                    className={inputCls}
                    placeholder="e.g. Food & Dining"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Icon</label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-2xl">
                    {selectedIcon}
                  </div>
                </div>
              </div>

              {/* Icon picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose Icon</label>
                <div className="grid grid-cols-10 gap-1.5 p-3 rounded-md border border-input bg-muted/30">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        "h-9 w-9 flex items-center justify-center text-xl rounded-md transition-all",
                        selectedIcon === icon
                          ? "bg-primary/15 ring-2 ring-primary ring-offset-1"
                          : "hover:bg-muted"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { reset(); setShowForm(false); setSelectedIcon("🏷️"); }}
                  className="inline-flex items-center gap-1.5 rounded-md text-sm border border-input bg-background hover:bg-accent h-9 px-4"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isCreating ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-24" />
                  <div className="h-2 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Tag className="h-12 w-12 opacity-20" />
            <p className="text-sm">No categories found. Create one to get started!</p>
          </div>
        ) : (
          filtered.map((category) => (
            <Card key={category.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {editingId === category.id ? (
                  /* ── Edit mode ── */
                  <form onSubmit={handleSubmitEdit(onEdit)} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{editIcon}</span>
                      <input
                        {...registerEdit("name", { required: true })}
                        className={inputCls}
                        placeholder="Category name"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select {...registerEdit("type")} className={selectCls}>
                        <option value="expense">💸 Expense</option>
                        <option value="income">💰 Income</option>
                      </select>
                    </div>
                    {/* Mini icon picker for edit */}
                    <div className="grid grid-cols-8 gap-1 p-2 rounded border bg-muted/30">
                      {ICON_OPTIONS.slice(0, 16).map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setEditIcon(icon)}
                          className={cn(
                            "h-8 w-8 flex items-center justify-center text-base rounded transition-all",
                            editIcon === icon ? "bg-primary/15 ring-1 ring-primary" : "hover:bg-muted"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 text-xs border border-input rounded-md px-2.5 py-1.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground rounded-md px-2.5 py-1.5 hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── View mode ── */
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                      {category.icon ?? "🏷️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{category.name}</p>
                      <CategoryBadge type={category.type} />
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
