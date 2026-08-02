import type { StructureResolver } from "sanity/structure";

/**
 * Guided Studio navigation instead of a flat, alphabetical document list.
 * Singletons (Site settings) are pinned as single items, not lists — this
 * is the "simple, guided UI" mitigation for both photographers having
 * Administrator access on Sanity's free plan (no scoped Editor role
 * available below Growth).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Projects")
        .child(S.documentTypeList("project").title("Projects")),
      S.listItem()
        .title("Pages")
        .child(S.documentTypeList("page").title("Pages")),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.listItem()
        .title("Pending media cleanup")
        .child(S.documentTypeList("mediaTombstone").title("Pending media cleanup")),
    ]);
