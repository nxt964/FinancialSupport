import { Pagination } from "../../components/news/Pagination.jsx";
import { ArticleCard } from "../../components/news/ArticleCard.jsx";
import { useState, useEffect } from "react";
import { apollo } from "../../lib/apollo.js";
import { FEATURED_NEWS } from "../../queries/featuredNews.js";
import { GET_FEATURED_NEWS_BY_CATEGORY } from "../../queries/featuredNewsByCat.js";
import { useSearchParams } from "react-router-dom";
import { NotFound } from "../../components/news/NotFound.jsx";
import { Link } from "react-router-dom";
import ArticleSkeleton from "../../components/skeletons/ArticleSkeleton.jsx";

export default function NewsFeed() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category")
    ? parseInt(searchParams.get("category"), 10)
    : null;
  const [page, setPage] = useState(1);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [invalidCategory, setInvalidCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
    setCategoryName("");
  }, [categoryId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (categoryId) {
          const { data } = await apollo.query({
            query: GET_FEATURED_NEWS_BY_CATEGORY,
            variables: { categoryId, page },
            fetchPolicy: "network-only",
          });
          const res = data.featuredNewsByCategory;

          setCategoryName(res.items?.[0]?.category?.name ?? "");

          if (!res || res.totalCount === 0) {
            setInvalidCategory(true);
            return;
          }

          setInvalidCategory(false);
          setFeaturedNews(res.items ?? []);
          setTotalPages(res.totalCount);
        } else {
          const { data } = await apollo.query({
            query: FEATURED_NEWS,
            variables: { page },
            fetchPolicy: "network-only",
          });
          const res = data.featuredNews;
          setFeaturedNews(res.items ?? []);
          setTotalPages(res.totalCount);
        }
      } catch (e) {
        console.error(e);
        setFeaturedNews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, page]);

  if (invalidCategory) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <nav
          className="flex px-5 py-4 rounded-lg mb-2 bg-[var(--color-LiteBg1)] border border-[var(--color-InputLine)] text-[var(--color-PrimaryText)]"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse text-base">
            {/* Home */}
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="inline-flex items-center font-medium hover:text-[var(--color-PrimaryColor)]"
              >
                <svg
                  className="w-4 h-4 me-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                Home
              </Link>
            </li>

            {/* News */}
            <li>
              <div className="flex items-center">
                <svg
                  className="rtl:rotate-180 w-4 h-4 mx-1 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <Link
                  to="/news"
                  className="ms-1 font-medium hover:text-[var(--color-PrimaryColor)]"
                >
                  News
                </Link>
              </div>
            </li>

            {/* Category */}
            {categoryName && categoryId && (
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="rtl:rotate-180 w-4 h-4 mx-1 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ms-1 font-medium text-[var(--color-TertiaryText)]">
                    {categoryName}
                  </span>
                </div>
              </li>
            )}
          </ol>
        </nav>
      </header>

      {/* Grid */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredNews.map((n) => (
              <ArticleCard key={n.id} {...n} />
            ))}
          </section>
        )}

        {/* Pagination */}
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </nav>
      </main>
    </div>
  );
}
