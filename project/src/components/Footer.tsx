import { Link } from 'react-router-dom';
import { BookOpen, Mail, Shield, Info } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export default function Footer() {
  const { settings } = useSiteSettings();

  const categories = [
    { slug: 'actors', name: 'Actors' },
    { slug: 'musicians', name: 'Musicians' },
    { slug: 'politicians', name: 'Politicians' },
    { slug: 'entrepreneurs', name: 'Entrepreneurs' },
    { slug: 'athletes', name: 'Athletes' },
    { slug: 'scientists', name: 'Scientists' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">{settings.site_name}</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.footer_about}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                  <Info size={13} /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                  <Mail size={13} /> Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                  <Shield size={13} /> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Advertise</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.site_name} reaches millions of readers interested in history and culture. Contact us to explore advertising opportunities.
            </p>
            <Link to="/contact" className="inline-block mt-3 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Get in touch &rarr;
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {settings.footer_copyright}</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
