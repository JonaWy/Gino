import { cn } from "@/lib/utils";

export function MobileListCard({
  children,
  actions,
  className,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4",
        className
      )}
    >
      {children}
      {actions && (
        <div className="flex items-center justify-end gap-1 border-t pt-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export function MobileListRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 text-sm",
        className
      )}
    >
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
