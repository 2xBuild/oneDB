import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-xs sm:text-sm text-muted-foreground">
            ©{new Date().getFullYear()} <Link href="https://oneDB.net/terms" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">oneDB</Link>.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            <Link href="https://github.com/2xBuild/oneDB" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Open source and community-driven</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
