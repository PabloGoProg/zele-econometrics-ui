import { ArrowRight } from 'lucide-react';
import type { Model } from '@/types';
import { Button } from '@/components/ui/Button';

interface ModelCardProps {
  model: Model;
  onOpen: (model: Model) => void;
}

export function ModelCard({ model, onOpen }: ModelCardProps) {
  return (
    <div className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <h3 className="text-base font-semibold text-primary-900">
          {model.display_name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {model.description}
        </p>
      </div>
      <div className="mt-4">
        <Button
          size="sm"
          onClick={() => onOpen(model)}
          className="gap-1.5"
        >
          Abrir
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
