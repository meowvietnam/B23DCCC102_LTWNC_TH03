import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/` },
    { url: `${BASE_URL}/books` },
    ...db.books.map((b) => ({ url: `${BASE_URL}/books/${b.id}` })),
  ];
}
