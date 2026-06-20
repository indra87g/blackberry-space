import { Hammer, CodeSquare } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary flex items-center justify-center mb-6">
        <CodeSquare className="w-8 h-8 text-on-primary" />
      </div>

      <Hammer className="w-12 h-12 text-on-surface-variant mb-6 animate-bounce" />

      <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-4 uppercase tracking-[0.05em]">
        Under Maintenance
      </h1>

      <p className="text-on-surface-variant text-lg max-w-md mb-8">
        We are currently performing scheduled maintenance to improve your experience. Blackberry
        Space will be back online shortly.
      </p>

      <div className="p-4 bg-surface-container border border-[rgba(255,255,255,0.05)] text-xs font-bold uppercase tracking-widest text-outline">
        Estimated downtime: ~15 minutes
      </div>
    </div>
  );
}
