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
      className="group block rounded-lg border border-gray-400 overflow-hidden hover:shadow-md transition"
    >
      <img
        src={coverImageUrl}
        alt={title}
        className="h-36 w-full object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-2">
          {new Date(publishedDate).toLocaleDateString()}
        </div>

        <h4 className="font-medium group-hover:underline line-clamp-2">
          {title}
        </h4>

        <button
          onClick={goCategory}
          className="mt-2 rounded-full bg-gray-100 hover:bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700"
          type="button"
        >
          {category?.name ?? "General"}
        </button>
      </div>
    </Link>
  );
}
