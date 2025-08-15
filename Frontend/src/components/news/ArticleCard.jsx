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
    <article className="group rounded-lg overflow-hidden bg-[var(--color-CardBg)] border border-[var(--color-InputLine)] shadow-sm hover:shadow-lg transition-shadow">
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
          <div className="flex items-center text-xs text-[var(--color-SecondaryText)]">
            <Link
              to={`?category=${category?.id}`}
              className="rounded-full bg-[var(--color-InputLine)] hover:bg-[var(--color-PrimaryColor)] hover:text-[var(--color-PrimaryText)] px-2 py-1 font-medium tracking-wide"
            >
              {category?.name || "GENERAL"}
            </Link>
            <span className="mx-2">•</span>
            <span className="uppercase tracking-wide">
              {diffHours < 24
                ? `${diffHours} hours ago`
                : published.toLocaleDateString()}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug hover:underline line-clamp-2">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
