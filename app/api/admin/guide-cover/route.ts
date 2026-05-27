import { NextResponse } from "next/server";

import {
  buildGuideCoverPath,
  GUIDE_COVER_MAX_BYTES,
  resolveGuideCoverContentType,
} from "@/lib/articles/cover-upload";
import { getSessionContext } from "@/lib/auth/require-session";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ctx = await getSessionContext();
  if (!ctx || ctx.role !== "admin") {
    return NextResponse.json({ ok: false, message: "FORBIDDEN" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "INVALID_FORM" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, message: "NO_FILE" }, { status: 400 });
  }
  if (file.size > GUIDE_COVER_MAX_BYTES) {
    return NextResponse.json({ ok: false, message: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const { path, ext } = buildGuideCoverPath(file.name);
  const contentType = resolveGuideCoverContentType(file, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.storage.from("article-covers").upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      console.error("[guide-cover] upload failed:", error.message);
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const objectPath = data?.path ?? path;
    const { data: urlData } = supabase.storage.from("article-covers").getPublicUrl(objectPath);

    return NextResponse.json({ ok: true, url: urlData.publicUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UPLOAD_FAILED";
    console.error("[guide-cover] unexpected:", message);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
