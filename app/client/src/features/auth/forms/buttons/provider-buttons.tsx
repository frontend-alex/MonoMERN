import { Button } from "@/components/ui/button";
import { API_URL } from "@/hooks/api";

 export type Providers = {
  name: string;
  label: string;
};

interface ProviderButtonsProps {
  providers: Providers[];
  isPending: boolean;
}

export const ProviderButtons: React.FC<ProviderButtonsProps> = ({ providers, isPending }) => {
  const showText = providers?.length <= 2;

  return (
    <div className={`grid gap-3 grid-cols-${Math.min(providers?.length || 1, 5)}`}>
      {providers?.map(({ name, label }) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          disabled={isPending}
          className="flex-1 items-center justify-center gap-2 cursor-pointer"
          onClick={() => window.open(`${API_URL}/auth/${name}`, '_blank', 'noopener,noreferrer')}
        >
          <img loading="lazy" className="w-4 h-4" src={`/images/providers/${name}.webp`}/>
          {showText && <span>{`${label}`}</span>}
        </Button>
      ))}
    </div>
  );
};
