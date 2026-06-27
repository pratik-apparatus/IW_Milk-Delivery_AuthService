import type { Request } from "express";

export function getTenantIdFromRequest(req: Request): string | undefined {
  const header = req.headers["x-tenant-id"];
  if (typeof header === "string") {
    const trimmed = header.trim();
    return trimmed || undefined;
  }
  if (Array.isArray(header) && header.length > 0) {
    const trimmed = header[0]?.trim();
    return trimmed || undefined;
  }
  return undefined;
}
