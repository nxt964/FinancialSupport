import { Link } from "react-router-dom";

export function ArticleCard({
  id,
  title,
  category,
  publishedDate,
  coverImageUrl,
}) {
  const published = new Date(publishedDate);
  const now = new Date();
  const diffMs = now - published; // difference in milliseconds
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return (
    <article className="group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
      <Link to={`${id}`}>
        <div className="relative">
          <img
            src={coverImageUrl}
            alt=""
            className="h-44 w-full object-cover sm:h-40 lg:h-44 xl:h-40"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center text-xs text-gray-500">
            <Link
              to={`?category=${category?.id}`}
              className="rounded-full bg-gray-100 hover:bg-gray-200 px-2 py-1 font-medium tracking-wide"
            >
              {category?.name || "GENERAL"}
            </Link>
            <span className="mx-2 text-gray-300">•</span>
            <span className="uppercase tracking-wide">
              {diffHours < 24
                ? `${diffHours} hours ago`
                : published.toLocaleDateString()}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug hover:underline">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
