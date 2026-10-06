import { createFileRoute } from "@tanstack/react-router";
import { CustomerApp } from "@/components/demo/CustomerApp";
import { DemoBar } from "@/components/demo/DemoBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oasis Regulars — Customer app demo" },
      {
        name: "description",
        content:
          "Clickable demo of Oasis Regulars, the free earned-status loyalty programme for Oasis Express grocery delivery in Dubai.",
      },
      { property: "og:title", content: "Oasis Regulars — Customer app demo" },
      {
        property: "og:description",
        content: "Free earned-status loyalty programme demo for Oasis Express, Dubai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBar />
      <main className="flex flex-1 items-start justify-center p-4 md:py-8">
        <CustomerApp />
      </main>
    </div>
  );
}
