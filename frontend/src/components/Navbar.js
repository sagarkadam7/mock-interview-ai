import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navGhostBtn =
  "inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-white/80 px-5 py-2 text-[13px] font-medium text-aura-muted shadow-sm backdrop-blur-sm transition-[transform,background-color,border-color,color,box-shadow] duration-250 ease-out-expo hover:border-slate-300 hover:bg-white hover:text-aura-ink active:scale-[0.97] no-underline";

const navGhostActive =
  "!border-slate-300 !bg-white !text-aura-ink shadow-md shadow-slate-200/60";

const navCtaBtn =
  "inline-flex items-center justify-center rounded-full border-0 bg-aura-ink px-5 py-2 text-[13px] font-bold text-white no-underline shadow-md transition-[transform,background-color,box-shadow] duration-250 ease-out-expo hover:bg-zinc-800 hover:shadow-lg hover:shadow-slate-400/20 active:scale-[0.97]";

const profilePill =
  "mr-0.5 hidden items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm transition-colors duration-250 sm:flex";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
          ? "border-slate-200/90 bg-white/90 shadow-md shadow-slate-200/40 backdrop-blur-xl"
          : "border-slate-200/60 bg-white/75 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="group relative flex items-center gap-3 no-underline transition-opacity duration-200 hover:opacity-80">
          <span className="text-[11px] font-semibold uppercase tracking-aura text-aura-ink">Interview.AI</span>
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-aura-coral to-aura-violet transition-[width] duration-350 ease-out-expo group-hover:w-full" />
        </NavLink>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className={profilePill} title={user.name}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white ring-1 ring-white/40">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium text-aura-muted md:max-w-[140px]">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <NavLink to="/dashboard" className={({ isActive }) => `${navGhostBtn} ${isActive ? navGhostActive : ""}`}>
                Dashboard
              </NavLink>
              <NavLink to="/interview/new" className={navCtaBtn}>
                New interview
              </NavLink>
              <button type="button" className={navGhostBtn} onClick={handleLogout}>
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
