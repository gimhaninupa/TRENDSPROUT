import { Navbar } from '../../components/shared';
import { Screen } from '../../components/shared';

export function AboutScreen({ onNavigate }: { onNavigate: (s: Screen | string) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar onNavigate={onNavigate as any} />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-24">
        <h1 className="text-4xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Clash Display', sans-serif" }}>About Us</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
          Content for About Us coming soon.
        </div>
      </div>
      <footer className="bg-gray-900 py-14 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gray-500 text-xs">© 2026 TRENDSPROUT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
