import Image from "next/image";
import Link from "next/link";
import { cn } from "@traderiq/ui";

interface LogoProps {
  variant?: "dark" | "light" | "text";
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}

const SIZE_PX: Record<NonNullable<LogoProps["size"]>, { w: number; h: number }> = {
  sm: { w: 100, h: 32 },
  md: { w: 140, h: 44 },
  lg: { w: 220, h: 70 },
};

export function Logo({ variant = "light", size = "md", href = "/dashboard", className }: LogoProps) {
  const dims = SIZE_PX[size];

  let inner: React.ReactNode;
  if (variant === "text") {
    inner = (
      <span
        className={cn(
          "select-none font-extrabold tracking-tight text-brand",
          size === "sm" && "text-lg",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl",
        )}
      >
        Trader IQ
      </span>
    );
  } else {
    inner = (
      <Image
        src={variant === "dark" ? "/logo-dark.png" : "/logo-light.png"}
        alt="Trader IQ"
        width={dims.w}
        height={dims.h}
        priority
        className={cn("h-auto w-auto object-contain", size === "sm" && "h-8", size === "md" && "h-10", size === "lg" && "h-16")}
      />
    );
  }

  if (!href) return <div className={className}>{inner}</div>;
  return (
    <Link href={href as never} className={cn("inline-flex items-center gap-2", className)}>
      {inner}
    </Link>
  );
}
