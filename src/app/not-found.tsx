import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-error-container flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-on-error-container" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-on-surface-variant text-lg mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/snippets/discover" className="btn-primary px-6 py-3 uppercase tracking-wider">
        Return to Discover
      </Link>
    </div>
  );
}
