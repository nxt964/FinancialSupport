const ArticleHomepageSkeleton = () => {
  return (
    <article className="group flex rounded-lg overflow-hidden bg-[var(--color-CardBg)] border border-[var(--color-InputLine)] shadow-sm animate-pulse">
      {/* Left: Image placeholder */}
      <div className="w-1/3 bg-[var(--color-InputLine)] h-32 sm:h-28 lg:h-32" />

      {/* Right: Content placeholder */}
      <div className="flex flex-col justify-between p-4 flex-1">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-[var(--color-InputLine)] rounded w-3/4" />
          <div className="h-4 bg-[var(--color-InputLine)] rounded w-5/6" />
        </div>

        {/* Category + Date */}
        <div className="flex items-center text-xs mb-2">
          <div className="h-5 w-20 bg-[var(--color-InputLine)] rounded-full" />
          <span className="mx-2 text-[var(--color-InputLine)]">•</span>
          <div className="h-4 w-16 bg-[var(--color-InputLine)] rounded" />
        </div>
      </div>
    </article>
  );
};

export default ArticleHomepageSkeleton;
