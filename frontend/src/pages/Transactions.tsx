import { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { TransactionTimeline } from "../features/transaction/components/TransactionTimeline";
import { TransactionForm } from "../features/transaction/components/TransactionForm";
import { Search, Filter, Plus, X } from "lucide-react";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancel" : "Add Transaction"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Main List */}
        <div className={showForm ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          {/* Search and Filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["all", "income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`inline-flex items-center justify-center rounded-md text-xs font-medium h-9 px-3 transition-colors ${
                    filterType === t
                      ? "bg-primary text-primary-foreground"
                      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <TransactionTimeline search={search} filterType={filterType} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Form */}
        {showForm && (
          <div className="lg:col-span-1">
            <TransactionForm onSuccess={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
