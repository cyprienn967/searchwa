import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Steer",
  description: "Articles and insights about personalized search technology and the future of search engines",
};

export default async function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "Times New Roman, Times, serif" }}>
          The Steer Blog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Insights and perspectives on personalized search technology, user experience, and the future of finding information online.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link 
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md"
          >
            <div className="h-48 w-full overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100">
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-5xl">{post.emoji}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">{post.date}</p>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors" style={{ fontFamily: "Times New Roman, Times, serif" }}>
                {post.title}
              </h2>
              <p className="text-gray-600 line-clamp-3">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 