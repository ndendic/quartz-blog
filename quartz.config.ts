import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Nikola Dendić",
    pageTitleSuffix: " — Jung, Technology & Philosophy",
    enableSPA: true,
    enablePopovers: false,
    analytics: null,
    locale: "en-US",
    baseUrl: "localhost:8080",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Poppins",
        body: "Poppins",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#ffffff",
          lightgray: "#e4e4e7",
          gray: "#a1a1aa",
          darkgray: "#374151",
          dark: "#18181b",
          secondary: "#3f3f46",
          tertiary: "#71717a",
          highlight: "rgba(113, 113, 122, 0.08)",
          textHighlight: "#fef08a88",
        },
        darkMode: {
          light: "#18181b",
          lightgray: "#3f3f46",
          gray: "#71717a",
          darkgray: "#d4d4d8",
          dark: "#fafafa",
          secondary: "#a1a1aa",
          tertiary: "#71717a",
          highlight: "rgba(161, 161, 170, 0.08)",
          textHighlight: "#fef08a33",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.DatastarLoader({ dsVersion: "1.0.0-RC.8" }),
    ],
    filters: [Plugin.ExplicitPublish()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
