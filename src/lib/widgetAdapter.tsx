import { Component, ErrorInfo, ReactNode, Suspense } from "react";
import { z } from "zod";
import { Hero } from "@/components/Hero";
import { ValueProps } from "@/components/ValueProps";
import { VaultCarousel } from "@/components/VaultCarousel";
import { EmailCapture } from "@/components/EmailCapture";
import type { Widget } from "./gql";

/**
 * Widget Error Boundary
 * Isolates failures to individual widgets without crashing the page
 */
class WidgetErrorBoundary extends Component<
  { children: ReactNode; widgetType: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; widgetType: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Widget render failed [${this.props.widgetType}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="cardmint-tile cardmint-tile--flat bg-destructive/10 border-destructive/20">
          <p className="text-sm text-muted-foreground">
            Widget "{this.props.widgetType}" failed to render
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Widget Loading Skeleton
 */
const WidgetSkeleton = () => (
  <div className="cardmint-tile cardmint-tile--flat animate-pulse">
    <div className="h-48 bg-muted/20 rounded" />
  </div>
);

/**
 * Widget Props Schemas (Zod validation per type)
 * Extend as new widget types are added to CMS
 */
const HeroPropsSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    ctaText: z.string().optional(),
  })
  .optional();

const ValuePropsSchema = z
  .object({
    items: z
      .array(
        z.object({
          icon: z.string().optional(),
          title: z.string(),
          description: z.string(),
        })
      )
      .optional(),
  })
  .optional();

const CarouselPropsSchema = z
  .object({
    items: z
      .array(
        z.object({
          image: z.string(),
          title: z.string().optional(),
        })
      )
      .optional(),
  })
  .optional();

const EmailCapturePropsSchema = z
  .object({
    heading: z.string().optional(),
    description: z.string().optional(),
  })
  .optional();

/**
 * Widget Type Registry
 * Maps CMS widget types to React components + prop schemas
 */
const WIDGET_REGISTRY = {
  hero: {
    component: Hero,
    schema: HeroPropsSchema,
  },
  "value-props": {
    component: ValueProps,
    schema: ValuePropsSchema,
  },
  carousel: {
    component: VaultCarousel,
    schema: CarouselPropsSchema,
  },
  "email-capture": {
    component: EmailCapture,
    schema: EmailCapturePropsSchema,
  },
} as const;

type WidgetType = keyof typeof WIDGET_REGISTRY;

/**
 * Render a single CMS widget with validation and error handling
 */
function renderWidget(widget: Widget, index: number): ReactNode {
  const { type, props = {} } = widget;

  // Unknown widget type - render placeholder
  if (!(type in WIDGET_REGISTRY)) {
    console.warn(`Unknown widget type: ${type}`, widget);
    return (
      <div key={`unknown-${index}`} className="sr-only" aria-hidden>
        {/* Skip unknown widgets silently in production */}
      </div>
    );
  }

  const widgetType = type as WidgetType;
  const { component: Component, schema } = WIDGET_REGISTRY[widgetType];

  // Validate props
  const parsed = schema.safeParse(props);
  if (!parsed.success) {
    console.error(`Invalid props for widget ${type}:`, parsed.error);
    return (
      <div key={`invalid-${index}`} className="cardmint-tile cardmint-tile--flat bg-destructive/10 border-destructive/20">
        <p className="text-sm text-muted-foreground">
          Widget "{type}" has invalid configuration
        </p>
      </div>
    );
  }

  // Render with error boundary
  // Note: Widget components are currently hardcoded and don't accept props.
  // Props from CMS (parsed.data) are validated but not passed until components
  // are updated to accept them for dynamic content.
  return (
    <WidgetErrorBoundary key={widget.id ?? `${type}-${index}`} widgetType={type}>
      <Suspense fallback={<WidgetSkeleton />}>
        <Component />
      </Suspense>
    </WidgetErrorBoundary>
  );
}

/**
 * Render an array of CMS widgets
 * @param widgets - Array of widgets from CMS (sorted by order)
 * @returns Array of React nodes
 */
export function renderWidgets(widgets: Widget[]): ReactNode[] {
  if (!widgets || widgets.length === 0) {
    return [];
  }

  // Sort by order field if present
  const sorted = [...widgets].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  return sorted.map((widget, index) => renderWidget(widget, index));
}

/**
 * Check if a widget type is supported
 */
export function isWidgetSupported(type: string): boolean {
  return type in WIDGET_REGISTRY;
}

/**
 * Get list of supported widget types (for debugging/docs)
 */
export function getSupportedWidgetTypes(): string[] {
  return Object.keys(WIDGET_REGISTRY);
}
