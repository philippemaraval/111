import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  title?: string;
};

export function LogoMark({ className, title = "111" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      className={cn("h-12 w-12", className)}
    >
      <path
        fill="currentColor"
        d="M60 4C81 4 102 13 111 31c9 18 7 43 3 62-4 17-19 22-36 24-19 3-39 2-53-10C11 95 5 77 6 59 7 40 10 23 26 14 36 8 48 4 60 4Z"
      />
      <path
        fill="white"
        d="M27 58 42 35h12l-8 24 8 7v27H40V68L27 58Zm29 0 15-23h12l-8 24 8 7v27H69V68L56 58Zm29 0 15-23h10l-7 24 8 7v27H98V68L85 58Z"
      />
    </svg>
  );
}
