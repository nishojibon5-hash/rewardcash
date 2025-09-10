import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { LANDINGS, getLanding } from "@shared/landings";
import ShareBar from "@/components/ShareBar";

function setMeta(description: string) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", description);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function JsonLd({ data }: { data: any }) {
  const json = useMemo(() => JSON.stringify(data), [data]);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default function Landing() {
  const { slug } = useParams<{ slug: string }>();
  const landing = getLanding(slug || "");

  useEffect(() => {
    if (!landing) return;
    document.title = `${landing.title} — RewardCash`;
    setMeta(landing.description);
    const { origin } = window.location;
    setCanonical(`${origin}/l/${landing.slug}`);
  }, [landing]);

  if (!landing) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-extrabold">Not Found</h1>
        <p className="text-slate-600 mt-2">
          We couldn't find this page. Explore topics below.
        </p>
        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {LANDINGS.map((l) => (
            <li key={l.slug}>
              <Link
                className="text-blue-600 hover:underline"
                to={`/l/${l.slug}`}
              >
                {l.h1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: landing.h1,
        item: `/l/${landing.slug}`,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <section className="p-5 sm:p-8 bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50 rounded-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {landing.h1}
        </h1>
        <p className="text-slate-700 mt-2 text-sm sm:text-base">
          {landing.description}
        </p>
      </section>

      <ShareBar />

      <section className="p-4 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <div className="prose prose-slate max-w-none">
          {landing.sections.map((s, i) => (
            <div key={i} className="mb-4">
              <h2 className="text-xl font-bold">{s.heading}</h2>
              <p className="mt-1 text-sm text-slate-700">{s.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <h2 className="text-xl font-bold">FAQs</h2>
        <div className="mt-2 divide-y divide-slate-200">
          {landing.faqs.map((f, i) => (
            <div key={i} className="py-3">
              <p className="font-semibold">{f.q}</p>
              <p className="text-sm text-slate-700 mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">Explore More</h2>
        <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {LANDINGS.filter((l) => l.slug !== landing.slug)
            .slice(0, 8)
            .map((l) => (
              <li key={l.slug}>
                <Link
                  className="text-blue-600 hover:underline"
                  to={`/l/${l.slug}`}
                >
                  {l.h1}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
    </div>
  );
}
