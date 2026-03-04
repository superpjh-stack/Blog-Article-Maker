// Placeholder post page — expand with MDX or a CMS later
export default function PostPage({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-2">Post: {params.slug}</h1>
      <p className="text-gray-500 text-sm mb-8">Coming soon</p>
      <p className="text-gray-600">
        Replace this with your actual post content.
      </p>
    </article>
  );
}
