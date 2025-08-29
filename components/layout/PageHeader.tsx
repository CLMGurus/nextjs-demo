import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  buttonLabel: string;
  buttonLink: string;
  buttonIcon: LucideIcon;
}

export function PageHeader({
  title,
  description,
  buttonLabel,
  buttonLink,
  buttonIcon: Icon,
}: PageHeaderProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 space-x-2">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={buttonLink}>
            <Button variant="default">
              <Icon /> {buttonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
