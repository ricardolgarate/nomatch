import { Facebook, Instagram } from 'lucide-react';

export const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/bfabllc/',
    handle: '@bfabllc',
    icon: 'instagram' as const,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@bfabllc',
    handle: '@bfabllc',
    icon: 'tiktok' as const,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/bfabllc',
    handle: '@bfabllc',
    icon: 'facebook' as const,
  },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function SocialIcon({
  icon,
  className,
}: {
  icon: (typeof SOCIAL_LINKS)[number]['icon'];
  className?: string;
}) {
  if (icon === 'instagram') {
    return <Instagram className={className} />;
  }

  if (icon === 'facebook') {
    return <Facebook className={className} />;
  }

  return <TikTokIcon className={className} />;
}

type SocialLinksProps = {
  variant: 'inline' | 'footer-list' | 'contact-list';
};

export default function SocialLinks({ variant }: SocialLinksProps) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.label} ${social.handle}`}
            className="text-sm text-bfab-600 hover:text-bfab-700 font-medium transition-colors inline-flex items-center gap-2"
          >
            <SocialIcon icon={social.icon} className="w-4 h-4" />
            {social.handle}
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'footer-list') {
    return (
      <>
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.label} ${social.handle}`}
            className="flex items-center gap-2 hover:text-bfab-600 transition-colors"
          >
            <SocialIcon icon={social.icon} className="w-4 h-4 shrink-0" />
            <span>{social.handle}</span>
          </a>
        ))}
      </>
    );
  }

  return (
    <>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${social.label} ${social.handle}`}
          className="flex items-center gap-3 text-white/85 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white transition-colors">
            <SocialIcon
              icon={social.icon}
              className="w-4 h-4 text-bfab-200 group-hover:text-bfab-700 transition-colors"
            />
          </div>
          <span>{social.handle}</span>
        </a>
      ))}
    </>
  );
}
