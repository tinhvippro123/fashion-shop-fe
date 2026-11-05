import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một file ảnh" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.name) continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-")
        .replace(/-+/g, "-");
      const ext = path.extname(cleanName) || ".jpg";
      const base = path.basename(cleanName, ext);
      const filename = `${Date.now()}-${base}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tải ảnh lên";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

