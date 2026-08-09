import { SocialIcon, socialLinkAriaLabel } from "@/components/site/SocialIcon";
import { normalizeSocialPlatform } from "@/lib/site/social";

type SocialLink = { platform?: string; url?: string };

export function Footer({
  brandName,
  contactEmail,
  socialLinks,
}: {
  brandName: string;
  contactEmail?: string;
  socialLinks?: SocialLink[];
}) {
  const links = (socialLinks ?? []).filter(
    (s): s is { platform: string; url: string } =>
      typeof s.url === "string" && s.url.trim().length > 0,
  );

  return (
    <footer className="border-t border-line py-12">
      <div className="mx-auto flex max-w-8xl flex-col gap-6 px-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {brandName}. Todos los derechos reservados.
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="transition-colors hover:text-fg"
            >
              {contactEmail}
            </a>
          )}

          {links.length > 0 && (
            <ul className="flex flex-wrap items-center gap-1">
              {links.map((s) => {
                const known = Boolean(normalizeSocialPlatform(s.platform));
                return (
                  <li key={`${s.platform}-${s.url}`}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={socialLinkAriaLabel(s.platform)}
                      title={socialLinkAriaLabel(s.platform)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash hover:text-accent focus-visible:text-accent"
                    >
                      {known ? (
                        <SocialIcon platform={s.platform} />
                      ) : (
                        <span className="text-xs font-medium">{s.platform}</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
