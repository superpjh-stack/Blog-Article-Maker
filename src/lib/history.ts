import { BlogPost } from "@/types/blog";

const KEY = "blog_history";
const MAX_POSTS = 50;

function load(): BlogPost[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(posts: BlogPost[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(posts));
  } catch { /* storage full — skip */ }
}

export function savePost(post: BlogPost) {
  const posts = load().filter((p) => p.id !== post.id); // dedupe
  posts.unshift(post);
  save(posts.slice(0, MAX_POSTS));
}

export function getAllPosts(): BlogPost[] {
  return load();
}

export function deletePost(id: string) {
  save(load().filter((p) => p.id !== id));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}
