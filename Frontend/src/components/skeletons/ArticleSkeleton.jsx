const ArticleSkeleton = () => {
  return (
    <article className="group rounded-lg overflow-hidden bg-[var(--color-CardBg)] border border-[var(--color-InputLine)] shadow-sm animate-pulse">
      <div className="relative">
        {/* Image placeholder */}
        <div className="h-44 w-full sm:h-40 lg:h-44 xl:h-40 bg-[var(--color-InputLine)]" />
      </div>
      <div className="p-4">
        {/* Category & date */}
        <div className="flex items-center text-xs mb-2">
          <div className="h-5 w-20 bg-[var(--color-InputLine)] rounded-full" />
          <span className="mx-2 text-[var(--color-InputLine)]">•</span>
          <div className="h-4 w-16 bg-[var(--color-InputLine)] rounded" />
        </div>

        {/* Title placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-[var(--color-InputLine)] rounded w-3/4" />
          <div className="h-4 bg-[var(--color-InputLine)] rounded w-5/6" />
        </div>
      </div>
    </article>
  );
};

export default ArticleSkeleton;
