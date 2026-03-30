import { cn } from '@/lib/utils'

type THeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function Heading({
  title,
  description,
  className
}: THeadingProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <h2 className="truncate text-lg font-bold tracking-tight text-primary sm:text-xl md:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="truncate text-xs text-muted-foreground sm:text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
