// src/app/blog/[slug]/page.tsx

import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Post Not Found | Steer Blog",
      description: "The requested blog post could not be found.",
    };
  }
  
  return {
    title: `${post.title} | Steer Blog`,
    description: post.excerpt,
  };
}

function formatMarkdown(content: string) {
  // Simple markdown to HTML conversion for headings and lists
  let html = content
    // Convert headings
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    // Convert bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert lists
    .replace(/^\- (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>')
    // Convert ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal my-1">$1</li>')
    // Convert paragraphs (lines that aren't headings or list items)
    .replace(/^(?!<h|<li)(.*$)/gm, '<p class="my-4">$1</p>')
    // Fix empty paragraphs
    .replace(/<p class="my-4"><\/p>/g, '<div class="my-4"></div>');

  return html;
}

type Props = {
  params: { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function BlogPostPage({ params }: Props) {
  const slug = params.slug;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link 
        href="/blog"
        className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-8"
      >
        ← Back to blog
      </Link>
      
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4">{post.emoji}</div>
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "Times New Roman, Times, serif" }}>
          {post.title}
        </h1>
        <p className="text-gray-500">{post.date}</p>
      </div>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
      />
    </div>
  );
}
