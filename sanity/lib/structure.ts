import type { StructureResolver } from "sanity/structure";

/**
 * Guided Studio navigation instead of a flat, alphabetical document list.
 * Singletons (site settings, fixed pages) are pinned as single items, not lists —
 * simple guided UI for editors on Sanity's free plan (no scoped Editor role
 * below Growth).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Proyectos")
        .child(S.documentTypeList("project").title("Proyectos")),
      S.listItem()
        .title("Páginas")
        .child(
          S.list()
            .title("Páginas")
            .items([
              S.listItem()
                .title("Inicio (/)")
                .id("singleton-homepage")
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("homepage")
                    .title("Inicio"),
                ),
              S.listItem()
                .title("Portafolio (/portfolio)")
                .id("singleton-page-portfolio")
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("pagePortfolio")
                    .title("Portafolio"),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Ajustes del sitio")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.listItem()
        .title("Limpieza de media pendiente")
        .child(S.documentTypeList("mediaTombstone").title("Limpieza de media pendiente")),
    ]);
