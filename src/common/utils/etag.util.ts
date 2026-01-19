import { createHash } from "crypto";

export const generateEtag = (value: any): string => {
  const payload = stableStringify(value);
  const hash = createHash("sha1").update(payload).digest("hex");
  return `"${hash}"`;
};

export const matchEtag = (ifNoneMatch: string | undefined, etag: string) => {
  if (!ifNoneMatch) {
    return false;
  }

  const candidates = ifNoneMatch
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeEtag);

  return candidates.includes(normalizeEtag(etag));
};

const normalizeEtag = (value: string) => {
  let normalized = value.trim();

  if (normalized.startsWith("W/")) {
    normalized = normalized.slice(2);
  }

  return normalized.replace(/^\"|\"$/g, "");
};

const stableStringify = (value: any): string => {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  const entries = keys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`
  );
  return `{${entries.join(",")}}`;
};
