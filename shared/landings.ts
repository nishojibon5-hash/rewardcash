export type Landing = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  sections: { heading: string; content: string }[];
  faqs: { q: string; a: string }[];
};

export const LANDINGS: Landing[] = [
  {
    slug: "us-survey-offers",
    title: "Best US Survey Offers — Earn Fast",
    h1: "Best US Survey Offers",
    description:
      "Discover quick, high‑quality survey offers for US audiences. Earn rewards fast with short, verified surveys.",
    keywords: [
      "US survey offers",
      "paid surveys USA",
      "quick surveys",
      "earn money online US",
    ],
    sections: [
      {
        heading: "Why Surveys?",
        content:
          "Surveys are a beginner‑friendly way to earn. Pick short surveys (2–5 minutes) with clear instructions and verified partners.",
      },
      {
        heading: "Tips to Maximize Earnings",
        content:
          "Complete your profile, stay consistent, and target surveys with higher ratings. Avoid abandoning mid‑way to keep approval rate high.",
      },
    ],
    faqs: [
      { q: "How long do surveys take?", a: "Usually 2–5 minutes per survey." },
      {
        q: "Do I need an account?",
        a: "No signup is required here; rewards are device‑based.",
      },
    ],
  },
  {
    slug: "usa-cashback-deals",
    title: "Top USA Cashback Deals — Save & Earn",
    h1: "Top USA Cashback Deals",
    description:
      "Shop smarter with instant cashback deals in the USA. Find limited‑time offers and stack savings.",
    keywords: ["cashback USA", "instant cashback", "save money shopping"],
    sections: [
      {
        heading: "How Cashback Works",
        content:
          "Click a partner store, complete the action, and receive cashback after verification. Combine with coupons for extra savings.",
      },
      {
        heading: "Best Times to Buy",
        content:
          "Look for seasonal sales and holiday events. Track price drops and use price‑match where available.",
      },
    ],
    faqs: [
      {
        q: "Is cashback instant?",
        a: "Most confirm within minutes to hours depending on the store.",
      },
      { q: "Any fees?", a: "No fees from us. Store policies may vary." },
    ],
  },
  {
    slug: "free-gift-card-offers",
    title: "Free Gift Card Offers — Legit Ways to Earn",
    h1: "Free Gift Card Offers",
    description:
      "Legit, limited‑time gift card offers you can complete without sign‑up. Earn rewards by following instructions.",
    keywords: ["free gift cards", "no signup rewards", "gift card deals"],
    sections: [
      {
        heading: "How to Qualify",
        content:
          "Look for tasks with clear instructions (visit/register/app install). Complete them in one session to avoid resets.",
      },
      {
        heading: "Stay Safe",
        content:
          "Use trusted networks and keep your device updated. Avoid sharing sensitive information on unknown forms.",
      },
    ],
    faqs: [
      {
        q: "Do gift cards expire?",
        a: "Some do. Check each offer’s terms before claiming.",
      },
      {
        q: "Mobile or desktop?",
        a: "Most offers support both; mobile‑first tends to convert faster.",
      },
    ],
  },
  {
    slug: "high-paying-cpa-offers",
    title: "High Paying CPA Offers — Beginner Guide",
    h1: "High Paying CPA Offers",
    description:
      "Understand and pick higher‑payout CPA offers. Focus on clear flows like register, install, or survey complete.",
    keywords: ["high cpa offers", "best cpa usa", "earn online guide"],
    sections: [
      {
        heading: "Select the Right Vertical",
        content:
          "Choose verticals aligned with your audience: survey, finance, shopping, or mobile apps with clean onboarding flows.",
      },
      {
        heading: "Optimize Conversions",
        content:
          "Use clear CTAs, fast pages, and reassure with trust badges. Test multiple creatives and measure CTR/CR.",
      },
    ],
    faqs: [
      {
        q: "What is CPA?",
        a: "Cost‑Per‑Action — you earn when the user completes a defined action.",
      },
      {
        q: "Are trials allowed?",
        a: "Follow each partner’s terms; some forbid incentivized trials.",
      },
    ],
  },
  {
    slug: "instant-rewards-no-signup",
    title: "Instant Rewards — No Signup Needed",
    h1: "Instant Rewards (No Signup)",
    description:
      "Claim rewards instantly without creating an account. Device‑based tracking ensures a quick start.",
    keywords: ["instant rewards", "no sign up", "quick earnings"],
    sections: [
      {
        heading: "Why No Signup?",
        content:
          "Frictionless experience helps users start fast and finish tasks reliably — perfect for mobile visitors.",
      },
      {
        heading: "What to Expect",
        content:
          "Short tasks (30–60s) with clear steps. Return here after completion to unlock rewards.",
      },
    ],
    faqs: [
      {
        q: "How is progress tracked?",
        a: "By device. Keep the same browser to avoid resets.",
      },
      {
        q: "Can I withdraw anytime?",
        a: "Withdraw once you reach the minimum balance threshold.",
      },
    ],
  },
  {
    slug: "top-us-mobile-offers",
    title: "Top US Mobile Offers — Fast Payouts",
    h1: "Top US Mobile Offers",
    description:
      "Mobile‑friendly offers optimized for US audiences. Quick flows, clear steps, and fast verification.",
    keywords: ["mobile offers US", "fast payouts", "android ios deals"],
    sections: [
      {
        heading: "Mobile First",
        content:
          "Pages load under 2s and are readable on small screens. Prefer Wi‑Fi for smoother app installs.",
      },
      {
        heading: "Quality Signals",
        content:
          "We highlight offers with high completion rates and positive feedback for better outcomes.",
      },
    ],
    faqs: [
      {
        q: "Do I need Wi‑Fi?",
        a: "Recommended for larger downloads and stable tracking.",
      },
      { q: "Tablet support?", a: "Yes, most offers work on tablets as well." },
    ],
  },
  {
    slug: "student-earn-online-usa",
    title: "Student Guide: Earn Online in the USA",
    h1: "Student Earn Online (USA)",
    description:
      "Simple ways for students to earn online: surveys, apps, and cashback. Time‑boxed, safe, and verified.",
    keywords: [
      "student earn usa",
      "student jobs online",
      "survey for students",
    ],
    sections: [
      {
        heading: "Time Management",
        content:
          "Pick short tasks between classes. Track time and avoid distractions to complete efficiently.",
      },
      {
        heading: "Stay Compliant",
        content:
          "Always follow partner rules and local laws. Avoid any misleading actions.",
      },
    ],
    faqs: [
      {
        q: "Age requirements?",
        a: "Some offers are 18+; check each offer’s terms.",
      },
      {
        q: "Payment method?",
        a: "Withdraw to supported methods after reaching the threshold.",
      },
    ],
  },
  {
    slug: "save-money-shopping-usa",
    title: "Save Money Shopping — USA Deals",
    h1: "Save Money Shopping (USA)",
    description:
      "Find deals and cashback to reduce everyday costs. Stack coupons and reward programs.",
    keywords: ["save money usa", "shopping deals", "cashback coupons"],
    sections: [
      {
        heading: "Deal Stacking",
        content:
          "Combine coupons, store rewards, and cashback for maximum savings. Watch for limited‑time promos.",
      },
      {
        heading: "Price Alerts",
        content:
          "Set alerts for products you track. Buy during drop windows to save more.",
      },
    ],
    faqs: [
      {
        q: "Can I use ad blockers?",
        a: "Disable blockers on partner pages to ensure tracking and rewards.",
      },
      {
        q: "Any regional limits?",
        a: "US‑focused, but many offers are available worldwide.",
      },
    ],
  },
];

export function getLanding(slug: string): Landing | undefined {
  return LANDINGS.find((l) => l.slug === slug);
}
