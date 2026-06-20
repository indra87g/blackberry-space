import { Swords, CodeSquare } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary flex items-center justify-center mb-6">
        <CodeSquare className="w-8 h-8 text-on-primary" />
      </div>

      <Swords className="w-12 h-12 text-on-surface-variant mb-6" />

      <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-4 uppercase tracking-[0.05em]">
        Coming Soon
      </h1>

      <p className="text-on-surface-variant text-lg max-w-md mb-8">
        We're working hard to bring you something amazing. This feature is currently in development
        and will be available soon.
      </p>

      <Link href="/" className="btn-primary px-8 py-3 text-sm uppercase tracking-wider">
        Go Back Home
      </Link>
    </div>
  );
}
