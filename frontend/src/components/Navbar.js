import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navGhostBtn =
  "inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-2 text-[13px] font-medium text-aura-muted transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white";

const navCtaBtn =
  "inline-flex items-center justify-center rounded-full border-0 bg-aura-cta px-5 py-2 text-[13px] font-bold text-zinc-900 transition-all duration-300 hover:bg-white hover:shadow-glow-violet";

const profilePill =
  "mr-0.5 hidden items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 sm:flex";

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
      className={`sticky top-0 z-[100] border-b transition-colors duration-200 ${
        scrolled ? "border-white/[0.08] bg-black/90 shadow-enterprise backdrop-blur-md" : "border-white/[0.06] bg-black/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3 no-underline">
          <span className="text-[11px] font-semibold uppercase tracking-aura text-white">Interview.AI</span>
        </Link>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className={profilePill} title={user.name}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white ring-1 ring-white/10">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium text-aura-muted md:max-w-[140px]">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <Link to="/dashboard">
                <button type="button" className={navGhostBtn}>
                  Dashboard
                </button>
              </Link>
              <Link to="/interview/new">
                <button type="button" className={navCtaBtn}>
                  New interview
                </button>
              </Link>
              <button type="button" className={navGhostBtn} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button type="button" className={navGhostBtn}>
                  Sign in
                </button>
              </Link>
              <Link to="/register">
                <button type="button" className={navCtaBtn}>
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
