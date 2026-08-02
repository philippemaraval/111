import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  title?: string;
};

export function LogoMark({ className, title = "111" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 192 192"
      role="img"
      aria-label={title}
      className={cn("h-12 w-12", className)}
    >
      <path
        fill="#0092cd"
        d="M104 0C86 1 65 5 50 12 33 20 20 33 12 47 4 62 1 74 1 83c1 11 1 22 2 33 1 17 6 30 14 37 7 8 11 14 19 21 11 9 26 12 42 15 18 4 38 2 52-1 14-3 28-10 37-23 11-12 17-24 21-39 3-14 2-31 2-48 0-14-3-25-9-38-6-13-16-22-30-29-12-6-28-10-34-11Z"
      />
      <path
        fill="white"
        d="m37 83 25-41h7l-2 108-18-4 1-52-13-11Zm43 0 25-41h7l-2 108-18-4 1-52-13-11Zm44 0 24-41h7l-2 108-18-4 1-52-12-11Z"
      />
    </svg>
  );
}
