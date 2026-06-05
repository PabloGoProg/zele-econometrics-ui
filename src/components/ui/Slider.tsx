import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export function Slider({ value, min, max, step, onValueChange, disabled }: SliderProps) {
  return (
    <RadixSlider.Root
      className="relative flex h-6 w-full touch-none select-none items-center"
      value={[value]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={([v]) => onValueChange(v)}
    >
      <RadixSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200">
        <RadixSlider.Range className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-700" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block h-5 w-5 rounded-full border-2 border-primary-600 bg-white shadow-md shadow-primary-900/20 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-50" />
    </RadixSlider.Root>
  );
}
