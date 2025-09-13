/**
 * Formats time in milliseconds to a human-readable format
 * @param ms - Time in milliseconds
 * @returns Formatted time string (e.g., "2.5s", "1m 30s", "1h 2m")
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  if (ms < 60000) {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  }

  if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Formats document titles, making auto-generated ones more user-friendly
 * @param title - The document title
 * @returns Formatted title string
 */
export function formatDocumentTitle(title: string): string {
  // Check if it's an auto-generated title (starts with "Document" followed by timestamp)
  if (title.startsWith("Document 20")) {
    try {
      // Extract the timestamp part
      const timestampPart = title.replace("Document ", "");
      // Convert back to readable format
      const isoString =
        timestampPart.replace(/-/g, ":").replace(/T/g, "T") + "Z";
      const date = new Date(isoString);

      if (!isNaN(date.getTime())) {
        return `Document from ${date.toLocaleDateString()} at ${date.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}`;
      }
    } catch {
      // If parsing fails, fall back to original title
    }
  }

  // Return original title if it's not auto-generated or parsing failed
  return title || "Untitled Document";
}

/**
 * Creates a clean filename from a document title
 * @param title - The document title
 * @returns Clean filename suitable for file downloads
 */
export function createFilename(title: string): string {
  const cleanTitle = title || "document";

  // If it's an auto-generated title, create a simpler filename
  if (
    cleanTitle.startsWith("Document 20") ||
    cleanTitle.startsWith("Document from")
  ) {
    const now = new Date();
    return `document-${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}`;
  }

  // For user-provided titles, clean them for filesystem safety
  return cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}
