import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navMutedLink =
  "inline-flex rounded-full px-3 py-2 text-[12px] font-semibold text-slate-500 no-underline transition-colors hover:bg-slate-100 hover:text-aura-ink";

const navGhostBtn =
  "inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-white/85 px-4 py-2 text-[13px] font-medium text-slate-600 shadow-sm backdrop-blur-md transition-[transform,background-color,border-color,color,box-shadow] duration-250 ease-out-expo hover:border-slate-300 hover:bg-white hover:text-aura-ink hover:shadow-md active:scale-[0.97] no-underline";

const navGhostActive = "!border-slate-300 !bg-white !text-aura-ink shadow-lux";

const navCtaBtn =
  "inline-flex items-center justify-center rounded-full border-0 bg-aura-ink px-5 py-2 text-[13px] font-bold text-white no-underline shadow-[0_2px_12px_-2px_rgba(15,23,42,0.35)] transition-[transform,background-color,box-shadow] duration-250 ease-out-expo hover:bg-zinc-800 hover:shadow-lg active:scale-[0.97]";

const profilePill =
  "mr-0.5 hidden items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm transition-colors duration-250 sm:flex";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className={`sticky top-0 z-[100] border-b transition-[border-color,background-color,box-shadow,backdrop-filter] duration-350 ease-out-expo ${
        scrolled
          ? "border-slate-200/90 bg-white/95 shadow-lux-nav backdrop-blur-xl"
          : "border-slate-200/50 bg-white/80 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-4 md:gap-6">
        <NavLink
          to="/"
          className="group relative flex min-w-0 shrink-0 items-center gap-3 no-underline transition-opacity duration-200 hover:opacity-90"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-black text-white shadow-lg shadow-aura-violet/25 ring-2 ring-white/50 transition-transform duration-300 group-hover:scale-[1.03]">
            IA
          </span>
          <span className="truncate text-[13px] font-bold tracking-tight text-aura-ink sm:text-sm">InterviewAI</span>
          <span className="absolute -bottom-1 left-11 h-px w-0 bg-gradient-to-r from-aura-coral to-aura-violet transition-[width] duration-350 ease-out-expo group-hover:w-[calc(100%-2.75rem)]" />
        </NavLink>

        <div className="hidden min-w-0 items-center gap-0.5 lg:flex">
          <NavLink to="/pricing" className={({ isActive }) => `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink" : ""}`}>
            Pricing
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink" : ""}`}>
            FAQ
          </NavLink>
        </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2.5">
          {user ? (
            <>
              <div className={profilePill} title={user.name}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white ring-2 ring-white/60">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[88px] truncate text-sm font-medium text-slate-600 md:max-w-[140px]">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <NavLink to="/dashboard" className={({ isActive }) => `${navGhostBtn} ${isActive ? navGhostActive : ""}`}>
                Dashboard
              </NavLink>
              <NavLink to="/interview/new" className={navCtaBtn}>
                New interview
              </NavLink>
              <button type="button" className={`${navGhostBtn} px-3 text-xs sm:px-4 sm:text-[13px]`} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `${navGhostBtn} ${isActive ? navGhostActive : ""}`}>
                Sign in
              </NavLink>
              <NavLink to="/register" className={navCtaBtn}>
                Get started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
