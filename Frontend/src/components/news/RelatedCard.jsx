// RelatedNews card
import { Link, useNavigate } from "react-router-dom";

export function RelatedCard({
  id,
  title,
  coverImageUrl,
  publishedDate,
  category,
}) {
  const navigate = useNavigate();

  const goCategory = (e) => {
    e.stopPropagation(); // don't trigger outer Link
    e.preventDefault(); // don't follow outer Link
    // if (!category) return;
    navigate(`/news?category=${category?.id}`);
  };

  return (
    <Link
      to={`/news/${id}`}
      className="group block rounded-lg border border-[var(--color-InputLine)] overflow-hidden hover:shadow-md transition"
    >
      <img
        src={coverImageUrl}
        alt={title}
        className="h-36 w-full object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <div className="text-xs text-[var(--color-SecondaryText)] mb-2">
          {new Date(publishedDate).toLocaleDateString()}
        </div>

        <h4 className="font-medium hover:underline line-clamp-2 mb-2">
          {title}
        </h4>

        <span
          onClick={goCategory}
          className="rounded-full px-2 py-1 text-sm text-[var(--color-PrimaryText)] bg-[var(--color-InputLine)] hover:bg-[var(--color-PrimaryColor)]"
          // type="button"
        >
          {category?.name ?? "General"}
        </span>
      </div>
    </Link>
  );
}
