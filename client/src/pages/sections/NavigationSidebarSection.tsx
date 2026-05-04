import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ScanBarcode,
  Settings,
  Workflow,
  Tag,
  ListChecks,
} from "lucide-react";

interface NavigationSidebarSectionProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const topActions = [
  {
    alt: "Import",
    src: "/figmaAssets/icon-1.svg",
    testId: "button-import",
  },
  {
    alt: "Notifications",
    src: "/figmaAssets/icon.svg",
    testId: "button-notifications",
  },
];

const planningItems: Array<{
  label: string;
  iconSrc: string;
  alt: string;
  href?: string;
  matchPaths: string[];
}> = [
  {
    label: "Shipments",
    iconSrc: "/figmaAssets/icon-2.svg",
    alt: "Shipments",
    href: "/shipments",
    matchPaths: ["/", "/shipments"],
  },
  {
    label: "Pickup",
    iconSrc: "/figmaAssets/package-2.svg",
    alt: "Pickup",
    matchPaths: [],
  },
  {
    label: "Quotes",
    iconSrc: "/figmaAssets/clipboard-list.svg",
    alt: "Quotes",
    matchPaths: [],
  },
  {
    label: "Wallet",
    iconSrc: "/figmaAssets/wallet.svg",
    alt: "Wallet",
    matchPaths: [],
  },
  {
    label: "Pick and Pack",
    iconSrc: "/figmaAssets/package-plus.svg",
    alt: "Pick and Pack",
    href: "/pick-and-pack",
    matchPaths: ["/pick-and-pack"],
  },
];

const resourceItems = [
  { label: "Roles and permissions", Icon: ScanBarcode },
  { label: "Automations", Icon: Workflow },
  { label: "Preferences", Icon: Settings },
  { label: "Branded Tracking", Icon: Tag },
  { label: "Defaults", Icon: ListChecks },
];

const collapsedSections = [
  {
    label: "RESOURCES",
    iconSrc: "/figmaAssets/chevron-right-1.svg",
    alt: "Chevron right",
  },
  {
    label: "SETTINGS",
    iconSrc: "/figmaAssets/chevron-right-1.svg",
    alt: "Chevron right",
  },
];

export const NavigationSidebarSection = ({
  isCollapsed = false,
  onToggleCollapse,
}: NavigationSidebarSectionProps): JSX.Element => {
  const [location] = useLocation();
  return (
    <aside className="w-full">
      <Card className="h-full min-h-[calc(100vh-1rem)] rounded-lg border-0 bg-sidebar shadow-none">
        <CardContent
          className={`flex h-full min-h-[calc(100vh-1rem)] flex-col items-stretch gap-4 pb-2 pt-4 ${
            isCollapsed ? "px-1" : "px-2"
          }`}
        >
          <header className="flex flex-col items-center gap-4">
            <div className="flex h-8 items-center justify-center">
              {isCollapsed ? (
                <img
                  className="h-6 w-6"
                  alt="Shiplo logo"
                  src="/figmaAssets/shiplo-mark.svg"
                  data-testid="img-sidebar-logo-collapsed"
                />
              ) : (
                <img
                  className="h-6 w-[84px]"
                  alt="Shiplo LT logo two"
                  src="/figmaAssets/shiplo-lt---logo---two-color.svg"
                />
              )}
            </div>
            <nav
              aria-label="Quick actions"
              className={`flex items-center justify-center gap-1.5 ${
                isCollapsed ? "flex-col" : ""
              }`}
            >
              {topActions.map((action, index) => (
                <Button
                  key={`${action.src}-${index}`}
                  type="button"
                  variant="ghost"
                  aria-label={action.alt}
                  data-testid={action.testId}
                  className="h-9 w-9 rounded border border-solid border-neutral-400 bg-transparent p-0 hover:bg-neutral-0/40"
                >
                  <img className="h-4 w-4" alt={action.alt} src={action.src} />
                </Button>
              ))}
            </nav>
          </header>
          <nav aria-label="Sidebar navigation" className="flex flex-1 flex-col">
            <div className={`flex flex-col gap-5 py-2 ${isCollapsed ? "px-0" : "px-1"}`}>
              {isCollapsed && (
                <div
                  className="mx-auto h-px w-8 bg-neutral-400"
                  aria-hidden="true"
                  data-testid="divider-top"
                />
              )}
              <section className="flex flex-col gap-1">
                {!isCollapsed && (
                  <div className="inline-flex items-center gap-2 pb-1">
                    <img
                      className="h-4 w-4"
                      alt="Chevron down"
                      src="/figmaAssets/chevron-down.svg"
                    />
                    <h2 className="font-body text-sm font-normal leading-none text-neutral-900">
                      PLANNING
                    </h2>
                  </div>
                )}
                <div
                  className={`flex flex-col ${
                    isCollapsed ? "items-center gap-1" : "gap-1 px-2"
                  }`}
                >
                  {planningItems.map((item) => {
                    const isActive = item.matchPaths.includes(location);
                    const testId = `nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                    const baseClasses = `flex h-auto items-center gap-2 rounded p-1 no-underline ${
                      isCollapsed ? "w-9 justify-center" : "w-full justify-start px-2 py-1"
                    } ${
                      isActive
                        ? "bg-brand-secondary text-brand-secondary-contrast hover:bg-brand-secondary/90"
                        : "bg-transparent text-neutral-700 hover:bg-neutral-0/40"
                    }`;
                    const inner = (
                      <>
                        <img
                          className={`h-6 w-6 shrink-0 ${isActive ? "brightness-0 invert" : ""}`}
                          alt={item.alt}
                          src={item.iconSrc}
                        />
                        {!isCollapsed && (
                          <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] [font-style:var(--subtitle-2-medium-font-style)]">
                            {item.label}
                          </span>
                        )}
                      </>
                    );

                    if (item.href) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          data-testid={testId}
                          title={isCollapsed ? item.label : undefined}
                          aria-label={isCollapsed ? item.label : undefined}
                          aria-current={isActive ? "page" : undefined}
                          className={baseClasses}
                        >
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        type="button"
                        disabled
                        data-testid={testId}
                        title={isCollapsed ? item.label : undefined}
                        aria-label={isCollapsed ? item.label : undefined}
                        className={`${baseClasses} cursor-not-allowed opacity-60`}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              </section>
              {isCollapsed && (
                <>
                  <div
                    className="mx-auto h-px w-8 bg-neutral-400"
                    aria-hidden="true"
                    data-testid="divider-resources"
                  />
                  <section
                    className="flex flex-col items-center gap-1"
                    aria-label="Resources"
                  >
                    {resourceItems.map(({ label, Icon }) => (
                      <Button
                        key={label}
                        type="button"
                        variant="ghost"
                        title={label}
                        aria-label={label}
                        data-testid={`nav-resource-${label.toLowerCase().replace(/\s+/g, "-")}`}
                        className="h-9 w-9 justify-center rounded p-1 text-neutral-700 hover:bg-neutral-0/40 hover:text-neutral-700"
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </Button>
                    ))}
                  </section>
                </>
              )}
              {!isCollapsed &&
                collapsedSections.map((section) => (
                  <section key={section.label} className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto inline-flex justify-start gap-2 self-start p-0 text-neutral-900 hover:bg-transparent hover:text-neutral-900"
                    >
                      <img
                        className="h-4 w-4"
                        alt={section.alt}
                        src={section.iconSrc}
                      />
                      <span className="font-body text-sm font-normal leading-none tracking-[0]">
                        {section.label}
                      </span>
                    </Button>
                  </section>
                ))}
            </div>
            <footer className={`mt-auto flex flex-col gap-3 pt-6 ${isCollapsed ? "px-0" : "px-2"}`}>
              {!isCollapsed && (
                <div className="flex w-full items-center gap-2 rounded-lg p-1">
                  <Avatar className="h-8 w-8 rounded-2xl bg-[hsl(322_77%_88%)]">
                    <AvatarFallback className="rounded-2xl bg-[hsl(322_77%_88%)] font-body-body-1 text-[length:var(--body-body-1-font-size)] font-[number:var(--body-body-1-font-weight)] leading-[var(--body-body-1-line-height)] tracking-[var(--body-body-1-letter-spacing)] text-neutral-900 [font-style:var(--body-body-1-font-style)]">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-body text-base font-normal leading-none text-neutral-900">
                      John Doe
                    </span>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="flex justify-center">
                  <Avatar className="h-8 w-8 rounded-2xl bg-[hsl(322_77%_88%)]">
                    <AvatarFallback className="rounded-2xl bg-[hsl(322_77%_88%)] text-xs text-neutral-900">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                {!isCollapsed && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-6 p-0 hover:bg-transparent"
                  >
                    <img
                      className="h-6 w-6"
                      alt="Icon settings"
                      src="/figmaAssets/icon-settings-lightmode.svg"
                    />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-6 p-0 hover:bg-transparent"
                  onClick={onToggleCollapse}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  data-testid="button-toggle-sidebar"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-5 w-5 text-neutral-700" />
                  ) : (
                    <ChevronLeftIcon className="h-5 w-5 text-neutral-700" />
                  )}
                </Button>
              </div>
            </footer>
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
};
