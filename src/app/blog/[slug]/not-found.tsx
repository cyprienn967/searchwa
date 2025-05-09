import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "Times New Roman, Times, serif" }}>
        Post Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        We couldn't find the blog post you're looking for.
      </p>
      <Link 
        href="/blog"
        className="inline-flex items-center text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md transition-colors"
      >
        Return to Blog
      </Link>
    </div>
  );
} 