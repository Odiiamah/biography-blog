import { Link } from 'react-router-dom';
import { BookOpen, Target, Users, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About BiographyHub — Life Stories of Influential People"
        description="BiographyHub is dedicated to publishing accurate, in-depth biographies of the world's most influential people across politics, entertainment, science, and business."
      />

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">About BiographyHub</h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Dedicated to telling the true stories of the people who shaped our world.
          </p>
        </div>
      </div>

      <AdSlot type="leaderboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="prose prose-slate prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            BiographyHub was created with one clear purpose: to make well-researched, factual, and readable biographies freely accessible to everyone. We believe that understanding the lives of influential people — their struggles, decisions, failures, and triumphs — is one of the most valuable forms of education available.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 my-10 not-prose">
            {[
              { icon: <Target size={22} />, title: 'Accuracy First', desc: 'Every biography is researched from credible sources. We never publish speculation as fact.' },
              { icon: <Users size={22} />, title: 'Diverse Subjects', desc: 'From Nobel laureates to chart-topping musicians, we cover every domain of human achievement.' },
              { icon: <CheckCircle size={22} />, title: 'Regular Updates', desc: 'Biographies are reviewed and updated as new verified information becomes available.' },
            ].map((item) => (
              <div key={item.title} className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <div className="text-amber-600 mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Cover</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            BiographyHub covers six major categories of influential people:
          </p>
          <ul className="space-y-2 mb-8 not-prose">
            {[
              ['Actors & Entertainers', 'The stars who defined cinema and television culture'],
              ['Musicians', 'Artists who shaped the sound of generations'],
              ['Politicians & Leaders', 'The figures who wielded power and changed nations'],
              ['Entrepreneurs', 'The visionaries who built companies and industries'],
              ['Athletes', 'The champions who pushed human physical limits'],
              ['Scientists & Inventors', 'The minds who expanded human knowledge'],
            ].map(([title, desc]) => (
              <li key={title} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <CheckCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900 text-sm">{title}</span>
                  <span className="text-slate-500 text-sm"> — {desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Standards</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Each biography on BiographyHub is structured to give readers a complete picture of a person's life:
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Introduction</strong> — A concise overview of why this person matters. <strong>Early Life</strong> — Their origins, family, and formative experiences. <strong>Education</strong> — Their academic and intellectual development. <strong>Career</strong> — Their professional journey and major achievements. <strong>Personal Life</strong> — Relationships, challenges, and the person behind the public image. <strong>Net Worth</strong> — A candid, sourced estimate of their financial standing. <strong>Key Facts</strong> — A scannable summary for quick reference.
          </p>
          <p className="text-slate-700 leading-relaxed">
            All biographies are written to be informative, engaging, and free from tabloid sensationalism. We focus on the facts, the context, and the significance of each person's life and work.
          </p>
        </div>

        <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Start Reading</h2>
          <p className="text-slate-400 mb-6">Browse hundreds of in-depth biographies across six categories.</p>
          <Link
            to="/"
            className="inline-block bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
          >
            Explore Biographies
          </Link>
        </div>
      </div>
    </>
  );
}
