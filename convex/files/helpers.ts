import { Doc, Id } from "../_generated/dataModel";
import { DatabaseReader } from "../_generated/server";

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    // Add more as needed
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

/**
 * Generate a unique storage key for a file
 */
export function generateStorageKey(
  teamId: Id<"teams">,
  userId: Id<"users">,
  filename: string
): string {
  const timestamp = Date.now();
  const extension = getFileExtension(filename);
  return `${teamId}/${userId}/${timestamp}-${filename}`;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = 100 * 1024 * 1024): boolean {
  return size <= maxSize;
}

/**
 * Validate file type
 */
export function validateFileType(type: string, allowedTypes: string[] = []): boolean {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(type.toLowerCase());
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if a file exists in a team
 */
export async function fileExistsInTeam(
  db: DatabaseReader,
  teamId: Id<"teams">,
  filename: string
): Promise<boolean> {
  const existingFile = await db
    .query("files")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .filter((q) => q.eq(q.field("name"), filename))
    .first();

  return existingFile !== null;
}

/**
 * Generate a unique filename if a file with the same name exists
 */
export function generateUniqueFilename(filename: string, count: number = 1): string {
  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf("."));
  
  if (count === 1) return filename;
  return `${nameWithoutExt} (${count}).${extension}`;
}
