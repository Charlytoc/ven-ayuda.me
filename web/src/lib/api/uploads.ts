import { API_BASE_URL } from "@/lib/api-base";

type PresignedUploadResponse = {
  file_upload_id: string;
  upload_url: string;
  expires_at: string;
};

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function attachmentPublicUrl(fileUploadId: string): string {
  return `${API_BASE_URL}/uploads/public/${fileUploadId}/`;
}

function resolveUploadUrl(uploadUrl: string): string {
  const apiOrigin = new URL(API_BASE_URL).origin;

  if (uploadUrl.startsWith("/")) {
    return `${apiOrigin}${uploadUrl}`;
  }

  const parsed = new URL(uploadUrl);
  if (parsed.pathname.startsWith("/api/")) {
    return `${apiOrigin}${parsed.pathname}${parsed.search}`;
  }

  return uploadUrl;
}

export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Solo se permiten imágenes (JPEG, PNG, WebP, GIF).");
  }

  const slotResponse = await fetch(`${API_BASE_URL}/uploads/presigned-url/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      ttl_seconds: 3600,
    }),
  });

  if (!slotResponse.ok) {
    let message = "No se pudo preparar la subida de la imagen.";
    try {
      const body = (await slotResponse.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const slot = (await slotResponse.json()) as PresignedUploadResponse;
  const uploadUrl = resolveUploadUrl(slot.upload_url);

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("No se pudo subir la imagen.");
  }

  return slot.file_upload_id;
}
