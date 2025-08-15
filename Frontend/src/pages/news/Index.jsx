import { Pagination } from "../../components/news/Pagination.jsx";
import { ArticleCard } from "../../components/news/ArticleCard.jsx";
import { useState, useEffect } from "react";
import { apollo } from "../../lib/apollo.js";
import { FEATURED_NEWS } from "../../queries/featuredNews.js";
import { GET_FEATURED_NEWS_BY_CATEGORY } from "../../queries/featuredNewsByCat.js";
import { useSearchParams } from "react-router-dom";
import { NotFound } from "../../components/news/NotFound.jsx";
import { IndexHeader } from "../../components/news/IndexHeader.jsx";
import ArticleSkeleton from "../../components/skeletons/ArticleSkeleton.jsx";
import { GET_CATEGORIES } from "../../queries/getCategories.js";
import { useQuery } from "@apollo/client";

const getInt = (val, def) => {
  const n = parseInt(val ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

export default function NewsFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category")
    ? getInt(searchParams.get("category"), null)
    : null;
  const page = getInt(searchParams.get("page"), 1);
  // const [page, setPage] = useState(1);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [invalidCategory, setInvalidCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const { data } = useQuery(GET_CATEGORIES);

  useEffect(() => {
    const currentCat = searchParams.get("category");
    const currentPage = searchParams.get("page");
    // If category changed OR page missing, set page=1
    if (categoryId && currentPage !== "1") {
      const next = new URLSearchParams(searchParams);
      next.set("page", "1");
      setSearchParams(next, { replace: true });
    }
    if (!categoryId && !currentCat && currentPage == null) {
      const next = new URLSearchParams(searchParams);
      next.set("page", "1");
      setCategoryName("All");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

          setCategoryName(res.items?.[0]?.category?.name ?? categoryName);

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

  const handlePageChange = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    // preserve category if present
    if (categoryId) next.set("category", String(categoryId));
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <IndexHeader
        categoryName={categoryName}
        categories={data?.getAllCategories ?? []}
      />

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
            onPageChange={handlePageChange}
          />
        </nav>
      </main>
    </div>
  );
}
