import { Link } from "react-router-dom";

export function ArticleCardHomepage({
  id,
  title,
  category,
  publishedDate,
  coverImageUrl,
}) {
  const published = new Date(publishedDate);
  const now = new Date();
  const diffMs = now - published;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  return (
    <article className="group flex rounded-lg overflow-hidden bg-[var(--color-CardBg)] border-2 border-[var(--color-InputLine)] shadow-sm hover:shadow-lg hover:text-[var(--color-PrimaryColor)] hover:border-[var(--color-PrimaryColor)] transition-all duration-300">
      <Link to={`/news/${id}`} className="flex w-full">
        {/* Left: Image */}
        <div className="relative w-1/4">
          <img
            src={coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Right: Content */}
        <div className="flex flex-col p-2 gap-2 flex-1 justify-between">
          {/* Title */}
          <h3 className="text-base font-semibold leading-snug hover:underline line-clamp-2">
            {title}
          </h3>

          {/* Category + Date */}
          <div className="flex items-center text-xs text-[var(--color-SecondaryText)]">
            <Link
              to={`news/?category=${category?.id}`}
              className="rounded-full bg-[var(--color-InputLine)] hover:bg-[var(--color-PrimaryColor)] hover:text-[var(--color-PrimaryText)] px-2 py-1 font-medium tracking-wide transition-all duration-200"
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
        </div>
      </Link>
    </article>
  );
}
