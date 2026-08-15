import { CircleDot, Flower2, Leaf, Sprout, Wheat } from 'lucide-react';
import type { Crop } from '../model/types';

type CropIconProps = {
  crop: Pick<Crop, 'name' | 'icon'>;
  size?: number;
};

function iconFromName(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes('пшен')) return 'wheat';
  if (normalized.includes('ячмен')) return 'barley';
  if (normalized.includes('кукуруз')) return 'corn';
  if (normalized.includes('подсолнеч')) return 'sunflower';
  if (normalized.includes('рапс')) return 'rapeseed';
  if (normalized.includes('соя') || normalized.includes('сое')) return 'soy';
  if (normalized.includes('горох') || normalized.includes('нут')) return 'pea';
  return 'sprout';
}

export function CropIcon({ crop, size = 22 }: CropIconProps) {
  const key = crop.icon ?? iconFromName(crop.name);
  const props = { size, color: '#2E7D32', 'aria-hidden': true as const };

  switch (key) {
    case 'wheat':
    case 'barley':
      return <Wheat {...props} />;
    case 'sunflower':
      return <Flower2 {...props} />;
    case 'rapeseed':
      return <Leaf {...props} />;
    case 'soy':
    case 'pea':
      return <CircleDot {...props} />;
    case 'corn':
      return <Sprout {...props} />;
    default:
      return <Sprout {...props} />;
  }
}
