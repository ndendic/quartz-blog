import { pathToRoot } from "../util/path"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface NavLink {
  label: string
  href: string
}

interface Options {
  links: NavLink[]
}

const defaultOptions: Options = {
  links: [{ label: "Home", href: "/" }],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function Navbar({ fileData, cfg }: QuartzComponentProps) {
    const baseDir = pathToRoot(fileData.slug!)
    const title = cfg?.pageTitle ?? "Home"

    return (
      <nav class="navbar">
        <div class="navbar-inner">
          <div class="navbar-left">
            {/* <a href={baseDir} class="navbar-title">{title}</a> */}
            <div class="navbar-links">
              {opts.links.map((link) => (
                <a href={link.href} class="navbar-link">
                  {link.label}
                </a>
              ))}
            </div>
            <button class="navbar-hamburger" aria-label="Menu" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="navbar-right">
            {/* Search and Darkmode are inserted here via layout */}
          </div>
        </div>
        <div class="navbar-mobile-menu">
          {opts.links.map((link) => (
            <a href={link.href} class="navbar-mobile-link">
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    )
  }

  Navbar.afterDOMLoaded = `
    document.addEventListener("nav", () => {
      const hamburger = document.querySelector(".navbar-hamburger")
      const mobileMenu = document.querySelector(".navbar-mobile-menu")
      if (!hamburger || !mobileMenu) return

      const toggle = () => {
        const expanded = hamburger.getAttribute("aria-expanded") === "true"
        hamburger.setAttribute("aria-expanded", String(!expanded))
        mobileMenu.classList.toggle("open")
      }

      hamburger.addEventListener("click", toggle)
      window.addCleanup(() => hamburger.removeEventListener("click", toggle))
    })
  `

  Navbar.css = `
    .navbar {
      width: 100%;
      margin-bottom: 1rem;
    }
    .navbar-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 800px;
      margin: 0 auto;
      padding: 0.75rem 0;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .navbar-title {
      font-family: var(--headerFont);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--dark);
      text-decoration: none;
    }
    .navbar-title:hover {
      color: var(--dark);
    }
    .navbar-links {
      display: flex;
      gap: 1rem;
    }
    .navbar-link {
      font-size: inherit;
      color: var(--gray);
      text-decoration: none;
      transition: color 0.2s;
    }
    .navbar-link:hover {
      color: var(--darkgray);
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .navbar-hamburger {
      display: none;
      background: none;
      border: none;
      color: var(--darkgray);
      cursor: pointer;
      padding: 0.25rem;
    }
    .navbar-mobile-menu {
      display: none;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem 0;
      max-width: 800px;
      margin: 0 auto;
    }
    .navbar-mobile-menu.open {
      display: flex;
    }
    .navbar-mobile-link {
      font-size: 0.9rem;
      color: var(--darkgray);
      text-decoration: none;
      padding: 0.4rem 0;
      border-left: 2px solid var(--lightgray);
      padding-left: 0.75rem;
    }
    .navbar-mobile-link:hover {
      color: var(--dark);
      border-left-color: var(--gray);
    }

    @media (max-width: 800px) {
      .navbar-links {
        display: none;
      }
      .navbar-hamburger {
        display: block;
      }
    }
  `

  return Navbar
}) satisfies QuartzComponentConstructor
