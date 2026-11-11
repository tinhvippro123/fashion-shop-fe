import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const isCloudinaryConfigured = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

async function uploadToCloudinary(buffer: Buffer, originalName: string): Promise<string> {
  const cleanName = path
    .parse(originalName)
    .name.toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "fashion_shop/products",
        public_id: `${Date.now()}-${cleanName}`,
        resource_type: "image",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error("Upload lên Cloudinary thất bại"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

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

    const uploadedUrls: string[] = [];
    let uploadsDir = "";

    // Nếu Cloudinary chưa được cấu hình, chuẩn bị thư mục local
    if (!isCloudinaryConfigured) {
      uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      if (!file.name) continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ưu tiên tải lên Cloudinary
      if (isCloudinaryConfigured) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(buffer, file.name);
          uploadedUrls.push(cloudinaryUrl);
          continue;
        } catch (cloudErr) {
          console.error("Cloudinary upload failed, falling back to local storage:", cloudErr);
          if (!uploadsDir) {
            uploadsDir = path.join(process.cwd(), "public", "uploads");
            await mkdir(uploadsDir, { recursive: true });
          }
        }
      }

      // Dự phòng lưu local nếu Cloudinary chưa bật hoặc lỗi mạng
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
