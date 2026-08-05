import React from "react";
import { Link } from "react-router-dom";

// Example usage: <Breadcrumbs crumbs={[{ name: 'Home', link: '/' }, { name: 'Shirts', link: '/products/shirts' }, { name: 'Cool T-Shirt' }]} />
const Breadcrumbs = ({ crumbs }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="mb-4 flex min-w-0 list-none flex-wrap items-center gap-y-1 p-0 text-sm text-slate-600">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex min-w-0 items-center">
            {crumb.link && index < crumbs.length - 1 ? (
              <Link className="max-w-[14rem] truncate text-blue-600 no-underline hover:text-blue-700 hover:underline" to={crumb.link}>{crumb.name}</Link>
            ) : (
              <span className="max-w-[18rem] truncate text-slate-700" aria-current={index === crumbs.length - 1 ? "page" : undefined}>{crumb.name}</span>
            )}
            {index < crumbs.length - 1 && <span className="mx-2 text-slate-400" aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
