import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";

interface LegalPageLayoutProps {
  title: string;
  emoji: string;
  effectiveDate: string;
  lastUpdated?: string;
  children: React.ReactNode;
  breadcrumbLabel: string;
}

export function LegalPageLayout({
  title,
  emoji,
  effectiveDate,
  lastUpdated,
  children,
  breadcrumbLabel,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-oxford-blue">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-paper/60 hover:text-mint transition-colors">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-paper/40" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-paper">{breadcrumbLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page header */}
        <header className="mb-10">
          <span className="text-4xl mb-4 block" role="img" aria-hidden="true">
            {emoji}
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-paper mb-3">
            {title}
          </h1>
          <p className="text-paper/60 text-sm">
            <time dateTime={effectiveDate}>Effective: {effectiveDate}</time>
            {lastUpdated && (
              <>
                {" | "}
                <time dateTime={lastUpdated}>Last Updated: {lastUpdated}</time>
              </>
            )}
          </p>
        </header>

        {/* Legal content with prose styling */}
        <article className="
          prose prose-invert prose-lg max-w-none
          prose-headings:font-display prose-headings:text-paper
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-paper/80 prose-p:leading-relaxed
          prose-li:text-paper/80
          prose-a:text-mint prose-a:no-underline hover:prose-a:underline
          prose-strong:text-paper prose-strong:font-semibold
          prose-blockquote:border-mint/50 prose-blockquote:text-paper/70 prose-blockquote:italic
          prose-ul:list-disc prose-ul:pl-6
          prose-ol:list-decimal prose-ol:pl-6
        ">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
}
