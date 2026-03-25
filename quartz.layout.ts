import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Navbar({
      links: [
        { label: "Home", href: "/" },
      ],
    }),
    Component.Search(),
    Component.Darkmode(),
    Component.ReaderMode(),
  ],
  afterBody: [
    Component.Datastar({ backendUrl: "http://localhost:8000" }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/ndendic",
      LinkedIn: "https://linkedin.com/in/ndendic",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.PageHeader(),
  ],
  left: [
    Component.PageTitle(),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.PageHeader(),
  ],
  left: [
    Component.PageTitle(),
    Component.Explorer(),
  ],
  right: [],
}
