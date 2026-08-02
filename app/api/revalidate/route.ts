import { revalidatePath } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sanity webhook target — fires only on document publish, not on a timer.
 * This is the "on-demand ISR, not time-based polling" design decision from
 * the architecture: API/build usage tracks actual edits, not visitor traffic.
 */
export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{ _type: string; slug?: { current: string } }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    // Always safe to revalidate the homepage (featured projects can change)
    revalidatePath("/");

    if (body._type === "project" && body.slug?.current) {
      revalidatePath(`/work/${body.slug.current}`);
    }
    if (body._type === "page" && body.slug?.current) {
      revalidatePath(`/${body.slug.current}`);
    }
    if (body._type === "siteSettings") {
      revalidatePath("/", "layout"); // nav/footer live in the root layout
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
