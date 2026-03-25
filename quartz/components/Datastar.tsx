import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  backendUrl: string
}

const defaultOptions: Options = {
  backendUrl: "http://localhost:8000",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function DatastarComponent(_props: QuartzComponentProps) {
    return <div id="datastar-root" data-backend-url={opts.backendUrl}></div>
  }

  DatastarComponent.afterDOMLoaded = `
    document.addEventListener("nav", () => {
      const root = document.getElementById("datastar-root")
      if (!root) return
      window.__DS_BACKEND = root.getAttribute("data-backend-url") || "${opts.backendUrl}"
      console.log("[Quartz+Datastar] Backend:", window.__DS_BACKEND)
    })
  `

  DatastarComponent.css = `
    /* Datastar form elements — matched to Quartz theme tokens */
    .ds-input {
      font-family: var(--bodyFont);
      font-size: 1rem;
      color: var(--darkgray);
      background: var(--light);
      border: 1px solid var(--lightgray);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .ds-input:focus {
      border-color: var(--secondary);
    }
    .ds-input::placeholder {
      color: var(--gray);
    }

    .ds-btn {
      font-family: var(--bodyFont);
      font-size: 0.9rem;
      color: var(--light);
      background: var(--secondary);
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.2rem;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
    }
    .ds-btn:hover {
      opacity: 0.85;
    }
    .ds-btn-outline {
      font-family: var(--bodyFont);
      font-size: 0.9rem;
      color: var(--secondary);
      background: transparent;
      border: 1px solid var(--secondary);
      border-radius: 8px;
      padding: 0.5rem 1.2rem;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .ds-btn-outline:hover {
      background: var(--secondary);
      color: var(--light);
    }

    /* Stats / metric cards */
    .ds-stats {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .ds-stat {
      text-align: center;
    }
    .ds-stat-value {
      font-family: var(--headerFont);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--dark);
    }
    .ds-stat-label {
      font-size: 0.8rem;
      color: var(--gray);
      margin-top: 0.2rem;
    }

    /* Status messages */
    .ds-success {
      color: var(--tertiary);
    }
    .ds-error {
      color: var(--secondary);
    }
    .ds-muted {
      color: var(--gray);
      font-style: italic;
    }

    /* Fade animation for SSE fragments */
    .ds-fade-in {
      animation: dsFadeIn 0.3s ease-in;
    }
    @keyframes dsFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `

  return DatastarComponent
}) satisfies QuartzComponentConstructor
