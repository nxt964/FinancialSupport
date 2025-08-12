import { RelatedCard } from "./RelatedCard";
import { RELATED_NEWS } from "../../queries/relatedNews";
import { apollo } from "../../lib/apollo";
import { useState, useEffect } from "react";

export const RelatedNews = ({ id }) => {
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apollo.query({
          query: RELATED_NEWS,
          variables: { id: Number(id) },
          fetchPolicy: "network-only",
        });
        setRelatedNews(data?.relatedNews ?? []);
      } catch (error) {
        console.error("Error fetching related news:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-2xl">Related News</h2>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedNews.map((article) => (
          <RelatedCard key={article.id} {...article} />
        ))}
      </div>
    </div>
  );
};
