export interface GenerateRequest {
  topic: string;
  tone: "professional" | "casual" | "educational";
  length: "short" | "medium" | "long";
  language: "ko" | "en";
}

export interface ImageResult {
  url: string;
  alt: string;
  credit: string;
}

export interface Reference {
  title: string;
  url: string;
  snippet: string;
}

export interface BlogPost {
  id: string;
  topic: string;
  title: string;
  content: string; // markdown
  images: ImageResult[];
  references: Reference[];
  createdAt: string;
}
