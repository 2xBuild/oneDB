import Link from "next/link";
import { Badge } from "./badge";

interface AccountCardProps {
    name: string;
    handle: string;
    niche: string;
    followers: string;
    bio: string;
    verified?: boolean;
    url: string;
    avatar?: string;
}

export function AccountCard({
    name,
    handle,
    niche,
    followers,
    verified = false,
    url,
    avatar
}: AccountCardProps) {
    // Generate initials for avatar placeholder
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="card flex items-center gap-4 hover:scale-[1.01] transition-transform p-4 border border-input rounded-lg bg-card text-card-foreground shadow-sm">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold border-2 border-accent/30 overflow-hidden">
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm">{initials}</span>
                    )}
                </div>
            </div>

            {/* Account Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground truncate">{name}</h3>
                    {verified && (
                        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span className="text-sm text-muted-foreground truncate">@{handle}</span>
                </div>
            </div>

            {/* Niche Badge */}
            <Badge variant="secondary" className="flex-shrink-0">
                {niche}
            </Badge>

            {/* Followers */}
            <div className="flex-shrink-0 text-right min-w-[80px]">
                <div className="text-sm font-semibold text-foreground">{followers}</div>
                <div className="text-xs text-muted-foreground">followers</div>
            </div>

            {/* Visit Button */}
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
                Visit →
            </Link>
        </div>
    );
}
