import BlogTemplate from "@/components/templates/blog-template";
import { BLOG_POSTS } from "@/lib/blog-posts";

export default function Page() {
  return <BlogTemplate posts={BLOG_POSTS} />;
}
