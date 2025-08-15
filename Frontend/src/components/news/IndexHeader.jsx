import { Link } from "react-router-dom";
import { ChartBarStacked, ChevronDown } from "lucide-react";

export const IndexHeader = ({ categoryName, categories = [] }) => {
  return (
    <header className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <nav
        className="flex px-5 py-4 rounded-lg mb-2 bg-[var(--color-LiteBg1)] border border-[var(--color-InputLine)] text-[var(--color-PrimaryText)] items-center"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-2 rtl:space-x-reverse text-base">
          {/* Home */}
          <li className="inline-flex items-center">
            <span className="inline-flex items-center font-medium">
              <ChartBarStacked className="w-4 h-4 me-2.5" />
              Category
            </span>
          </li>

          {/* Divider + Current label (All or category) */}
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-4 h-4 mx-1 text-[var(--color-SecondaryText)]"
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
                {categoryName || "All"}
              </span>
            </div>
          </li>
        </ol>

        {/* Browse categories dropdown */}
        <details className="ml-auto relative">
          <summary
            className="list-none inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--color-InputLine)] hover:border-[var(--color-PrimaryColor)] cursor-pointer select-none"
            aria-haspopup="menu"
          >
            {categoryName || ""}
            <ChevronDown className="w-4 h-4" />
          </summary>

          <div
            role="menu"
            className="absolute right-0 mt-2 w-64 max-h-80 overflow-auto rounded-lg border border-[var(--color-InputLine)] bg-[var(--color-LiteBg1)] shadow-lg p-2 z-20"
          >
            {/* All */}
            <Link
              to=""
              role="menuitem"
              className="block px-3 py-2 rounded-md hover:bg-[var(--color-InputLine)]/30"
            >
              All
            </Link>

            {/* Categories list */}
            <ul className="mt-1 space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to={c.path ?? `?category=${c.id}`}
                    role="menuitem"
                    className="block px-3 py-2 rounded-md hover:bg-[var(--color-InputLine)]/30"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </nav>
    </header>
  );
};
