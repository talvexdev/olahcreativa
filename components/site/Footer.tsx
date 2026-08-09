type SocialLink = { platform: string; url: string };

export function Footer({
  brandName,
  contactEmail,
  socialLinks,
}: {
  brandName: string;
  contactEmail?: string;
  socialLinks?: SocialLink[];
}) {
  return (
    <footer className="border-t border-line py-12">
      <div className="mx-auto flex max-w-8xl flex-col gap-4 px-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        <div className="flex gap-6">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:text-fg">{contactEmail}</a>
          )}
          {(socialLinks || []).map((s) => (
            <a key={s.url} href={s.url} className="hover:text-fg" target="_blank" rel="noreferrer">
              {s.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
