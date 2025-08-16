export function Pagination({ page, totalPages, onPageChange }) {
  const numbers = getPaginationNumbers(page, totalPages);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-40 hover:opacity-70 shadow-sm"
      >
        Prev
      </button>
      {numbers.map((n, idx) =>
        typeof n === "number" ? (
          <button
            key={`${n}-${idx}`}
            onClick={() => onPageChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={
              "h-10 w-10 flex items-center justify-center rounded-xl border text-sm font-semibold shadow-sm transition hover:opacity-80 " +
              (n === page
                ? "bg-[var(--color-PrimaryColor)]! text-[var(--color-TextLink)]"
                : "")
            }
          >
            {n}
          </button>
        ) : (
          <span key={`dots-${idx}`} className="px-2 select-none">
            …
          </span>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-40 hover:opacity-70 shadow-sm"
      >
        Next
      </button>
    </div>
  );
}

function getPaginationNumbers(page, total) {
  // Returns an array like: [1, 2, 3, 4, 5, '…', 10]
  const delta = 1; // neighbors around current
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("…");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  return rangeWithDots;
}
