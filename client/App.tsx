import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Withdraw from "./pages/Withdraw";
import Landing from "./pages/Landing";
import Counter from "./pages/Counter";
import Stream from "./pages/Stream";
import { AppStoreProvider, useAppStore } from "@/store/app-store";

const queryClient = new QueryClient();

function Layout() {
  const { state } = useAppStore();
  const usd = (state.balance || 0).toFixed(2);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-slate-200 bg-white/80">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center shadow text-white">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="6" width="18" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M7 8a2 2 0 0 1 2-2"></path>
                <path d="M17 16a2 2 0 0 1-2 2"></path>
              </svg>
            </div>
            <span className="font-extrabold tracking-tight text-lg">
              RewardCash
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-700">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200">
              EN
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 tabular-nums">
              ${usd}
            </span>
            <Link
              to="/counter"
              className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:bg-slate-50"
            >
              Counter
            </Link>
            <Link
              to="/withdraw"
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Withdraw
            </Link>
          </nav>
        </div>
      </header>
      <main className="container py-4">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="container py-6 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} RewardCash · Mobile-first US targeted
            offers
          </p>
          <p>No registration required. Rewards are device-based.</p>
        </div>
      </footer>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/stream" element={<Stream />} />
              <Route path="/l/:slug" element={<Landing />} />
              <Route path="/counter" element={<Counter />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
