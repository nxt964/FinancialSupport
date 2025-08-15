import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { NEWS_DETAILS } from "../../queries/newsDetails";
import { apollo } from "../../lib/apollo";
import { Loading } from "../../components/news/Loading";
import { NotFound } from "../../components/news/NotFound";
import { RelatedNews } from "../../components/news/RelatedNews";
import { Link } from "react-router-dom";

const Details = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data } = await apollo.query({
          query: NEWS_DETAILS,
          variables: { id: parseInt(id, 10) }, // server expects Int
          fetchPolicy: "network-only",
        });
        setArticle(data?.newsDetails ?? null);
      } catch (e) {
        setErr(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 text-[var(--color-PrimaryText)]">
      {loading && <Loading />}

      {article && (
        <div className="w-full max-w-5xl mx-auto h-full min-h-screen px-4 sm:px-6 lg:px-8 py-10">
          {/* Title */}

          <nav
            className="flex mb-2 text-[var(--color-PrimaryText)]"
            aria-label="Breadcrumb"
          >
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <li className="inline-flex items-center">
                <Link
                  to="/news"
                  className="inline-flex items-center text-lg font-medium hover:text-[var(--color-PrimaryColor)]"
                >
                  <svg
                    className="size-5 me-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                  News
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <Link
                    to={`/news?category=${article.category?.id}`}
                    className="inline-flex items-center text-lg font-medium hover:text-[var(--color-PrimaryColor)]"
                  >
                    <svg
                      className="rtl:rotate-180 size-5 text-gray-400 mx-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 9 4-4-4-4"
                      />
                    </svg>
                    <span class="ms-1 text-lg font-medium">
                      {article.category?.name || "General"}
                    </span>
                  </Link>
                </div>
              </li>
            </ol>
          </nav>

          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4">
            {article.title}
          </h2>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm bg-[var(--color-CardBg)] rounded-md px-4 py-3 mb-6 shadow-md">
            <span>
              By <span className="font-semibold">{article.author}</span>
            </span>
            <span className="hidden sm:inline">&#183;</span>
            <span>
              Updated on{" "}
              {new Date(article.publishedDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="hidden sm:inline">&#183;</span>
            {article.sentimentScore && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded
                ${
                  article.sentimentLabel === "positive"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : article.sentimentLabel === "negative"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-400"
                }
              `}
              >
                {article.sentimentLabel} (
                {Math.round(article.sentimentScore * 100)}%)
              </span>
            )}
          </div>

          {/* Cover Image */}
          <div className="mb-4">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full max-h-[450px] object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none  leading-relaxed">
            <p>{article.content}</p>
          </div>

          <hr className="h-px my-4 bg-[var(--color-InputLine)] border-0" />

          <RelatedNews id={id} />
        </div>
      )}

      {!article && !loading && <NotFound />}
    </div>
  );
};

export default Details;
