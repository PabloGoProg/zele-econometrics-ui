import { ArrowRight } from 'lucide-react';
import type { Model } from '@/types';
import { Button } from '@/components/ui/Button';

interface ModelCardProps {
  model: Model;
  onOpen: (model: Model) => void;
}

export function ModelCard({ model, onOpen }: ModelCardProps) {
  return (
    <div className="group flex min-h-44 flex-col justify-between rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-900/10">
      <div>
        <div className="mb-4 h-1.5 w-12 rounded-full bg-primary-600/80" />
        <h3 className="text-base font-bold text-primary-950">
          {model.display_name}
        </h3>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-500">
          {model.description}
        </p>
      </div>
      <div className="mt-4">
        <Button
          size="sm"
          onClick={() => onOpen(model)}
          className="gap-1.5 rounded-full"
        >
          Abrir
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
