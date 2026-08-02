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
    <footer className="border-t border-moss/40 py-12">
      <div className="mx-auto flex max-w-8xl flex-col gap-4 px-6 text-sm text-paper/70 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        <div className="flex gap-6">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:text-brass">{contactEmail}</a>
          )}
          {(socialLinks || []).map((s) => (
            <a key={s.url} href={s.url} className="hover:text-brass" target="_blank" rel="noreferrer">
              {s.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
