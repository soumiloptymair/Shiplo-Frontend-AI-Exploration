import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const topActions = [
  {
    alt: "Icon",
    src: "/figmaAssets/icon-1.svg",
  },
  {
    alt: "Icon",
    src: "/figmaAssets/icon.svg",
  },
];

const planningItems = [
  {
    label: "Shipments",
    iconSrc: "/figmaAssets/icon-2.svg",
    alt: "Icon",
    active: false,
  },
  {
    label: "Pickup",
    iconSrc: "/figmaAssets/package-2.svg",
    alt: "Package",
    active: false,
  },
  {
    label: "Quotes",
    iconSrc: "/figmaAssets/clipboard-list.svg",
    alt: "Clipboard list",
    active: false,
  },
  {
    label: "Wallet",
    iconSrc: "/figmaAssets/wallet.svg",
    alt: "Wallet",
    active: false,
  },
  {
    label: "Pick and Pack",
    iconSrc: "/figmaAssets/package-plus.svg",
    alt: "Package plus",
    active: true,
  },
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

export const NavigationSidebarSection = (): JSX.Element => {
  return (
    <aside className="w-full max-w-[118px]">
      <Card className="h-full min-h-[1008px] rounded-lg border-0 bg-[#e4eaed] shadow-none">
        <CardContent className="flex h-full min-h-[1008px] flex-col items-stretch gap-4 px-2 pb-2 pt-4">
          <header className="flex flex-col items-center gap-4">
            <div className="flex h-8 items-center justify-center">
              <img
                className="h-6 w-[84px]"
                alt="Shiplo LT logo two"
                src="/figmaAssets/shiplo-lt---logo---two-color.svg"
              />
            </div>
            <nav
              aria-label="Quick actions"
              className="flex items-start justify-center gap-1.5"
            >
              {topActions.map((action, index) => (
                <Button
                  key={`${action.src}-${index}`}
                  type="button"
                  variant="ghost"
                  className="h-9 w-9 rounded border border-solid border-[#b8c6cc] bg-transparent p-0 hover:bg-white/40"
                >
                  <img className="h-4 w-4" alt={action.alt} src={action.src} />
                </Button>
              ))}
            </nav>
          </header>
          <nav aria-label="Sidebar navigation" className="flex flex-1 flex-col">
            <div className="flex flex-col gap-5 px-2 py-2">
              <section className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-2 pb-1">
                  <img
                    className="h-4 w-4"
                    alt="Chevron down"
                    src="/figmaAssets/chevron-down.svg"
                  />
                  <h2 className="[font-family:'Roboto',Helvetica] text-sm font-normal leading-none tracking-[0] text-[#0b1516]">
                    PLANNING
                  </h2>
                </div>
                <div className="flex flex-col gap-1 px-2">
                  {planningItems.map((item) => (
                    <Button
                      key={item.label}
                      type="button"
                      variant="ghost"
                      className={`h-auto w-40 justify-start gap-2 rounded px-4 py-1 ${
                        item.active
                          ? "bg-[#008572] text-white hover:bg-[#007563] hover:text-white"
                          : "bg-transparent text-[#45565b] hover:bg-white/40 hover:text-[#45565b]"
                      }`}
                    >
                      <img
                        className="h-6 w-6 shrink-0"
                        alt={item.alt}
                        src={item.iconSrc}
                      />
                      <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] [font-style:var(--subtitle-2-medium-font-style)]">
                        {item.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </section>
              {collapsedSections.map((section) => (
                <section key={section.label} className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto inline-flex justify-start gap-2 self-start p-0 text-[#0b1516] hover:bg-transparent hover:text-[#0b1516]"
                  >
                    <img
                      className="h-4 w-4"
                      alt={section.alt}
                      src={section.iconSrc}
                    />
                    <span className="[font-family:'Roboto',Helvetica] text-sm font-normal leading-none tracking-[0]">
                      {section.label}
                    </span>
                  </Button>
                </section>
              ))}
            </div>
            <footer className="mt-auto flex flex-col gap-4 px-2 pt-6">
              <div className="flex w-full items-center gap-2 rounded-lg p-1">
                <Avatar className="h-8 w-8 rounded-2xl bg-[#f7c9e5]">
                  <AvatarFallback className="rounded-2xl bg-[#f7c9e5] font-body-body-1 text-[length:var(--body-body-1-font-size)] font-[number:var(--body-body-1-font-weight)] leading-[var(--body-body-1-line-height)] tracking-[var(--body-body-1-letter-spacing)] text-[#0b1516] [font-style:var(--body-body-1-font-style)]">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="[font-family:'Roboto',Helvetica] text-base font-normal leading-none tracking-[0] text-[#0b1516]">
                    John Doe
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-between">
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
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-6 p-0 hover:bg-transparent"
                >
                  <img
                    className="h-6 w-6"
                    alt="Chevron right"
                    src="/figmaAssets/chevron-right.svg"
                  />
                </Button>
              </div>
            </footer>
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
};
