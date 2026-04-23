import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, BookOpen, LogIn } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export default function Header() {
  const { settings } = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const showAnnouncement = settings.header_show_announcement === 'true';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/category/actors', label: 'Actors' },
    { to: '/category/musicians', label: 'Musicians' },
    { to: '/category/politicians', label: 'Politicians' },
    { to: '/category/entrepreneurs', label: 'Entrepreneurs' },
    { to: '/category/athletes', label: 'Athletes' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      {showAnnouncement && settings.announcement_text && (
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center hidden sm:block">
          {settings.announcement_text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-amber-600 transition-colors">
              <BookOpen size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-bold text-slate-900 tracking-tight">{settings.site_name}</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest -mt-0.5">{settings.tagline}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <Link
              to="/admin/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LogIn size={15} />
              Admin
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-slate-100 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search biographies..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <LogIn size={15} />
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
