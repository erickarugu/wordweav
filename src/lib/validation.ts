import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(5, "Email must be at least 5 characters")
  .max(254, "Email must be less than 255 characters")
  .transform((email: string) => email.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 129 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  );

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 101 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .transform((name: string) => name.trim());

export const textContentSchema = z
  .string()
  .min(1, "Text content is required")
  .max(50000, "Text content must be less than 50,000 characters")
  .transform((text: string) => text.trim());

export const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(200, "Title must be less than 201 characters")
  .transform((title: string) => title.trim());

export const idSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid ID format")
  .min(1, "ID is required")
  .max(50, "ID must be less than 51 characters");

// API-specific validation schemas
export const newsletterSubscribeSchema = z.object({
  email: emailSchema,
  source: z.string().optional().default("website"),
});

export const textProcessingSchema = z.object({
  text: textContentSchema,
  title: titleSchema.optional(),
  mechanisms: z
    .array(z.string())
    .min(1, "At least one processing mechanism is required")
    .max(10, "Maximum 10 processing mechanisms allowed"),
});

export const userProfileUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const userRegistrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Sanitization functions
export function sanitizeHtml(input: string): string {
  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "&": "&amp;",
      };
      return entities[char] || char;
    });
}

export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  return sanitizeHtml(input.trim());
}

// SQL injection prevention helpers
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidCuid(cuid: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/;
  return cuidRegex.test(cuid);
}

// Request validation wrapper
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return {
        success: false,
        error: `Validation failed: ${errors}`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      error: "Invalid JSON in request body",
    };
  }
}

// Query parameter validation
export function validateQueryParam(
  param: string | null,
  schema: z.ZodSchema
): { success: boolean; data?: unknown; error?: string } {
  if (!param) {
    return { success: false, error: "Parameter is required" };
  }

  const result = schema.safeParse(param);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || "Invalid parameter",
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().regex(/^[a-zA-Z0-9._-]+$/, "Invalid filename"),
  size: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB"),
  type: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
});

// Security headers validation
export function validateSecurityHeaders(headers: Headers): {
  hasCSRF: boolean;
  hasValidOrigin: boolean;
  hasSecureHeaders: boolean;
} {
  const origin = headers.get("origin");
  const csrfToken = headers.get("x-csrf-token");
  const userAgent = headers.get("user-agent");

  // Check for CSRF token (should be implemented)
  const hasCSRF = !!csrfToken;

  // Validate origin/referer for CSRF protection
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    "http://localhost:3000",
    "https://wordweave.app", // Add your production domain
  ].filter(Boolean) as string[];

  const hasValidOrigin =
    !origin ||
    allowedOrigins.some((allowed: string) => origin.startsWith(allowed));

  // Check for suspicious patterns
  const hasSecureHeaders = !!userAgent && userAgent.length > 0;

  return {
    hasCSRF,
    hasValidOrigin,
    hasSecureHeaders,
  };
}
