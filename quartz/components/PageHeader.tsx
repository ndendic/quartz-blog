import { pathToRoot } from "../util/path"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface Options {
  imageUrl: string
  imageSize: number
}

const defaultOptions: Options = {
  imageUrl: "https://github.com/ndendic.png",
  imageSize: 100,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function PageHeader({ fileData, cfg }: QuartzComponentProps) {
    const baseDir = pathToRoot(fileData.slug!)
    const title = fileData.frontmatter?.title ?? ""
    const tags = fileData.frontmatter?.tags ?? []
    const date = fileData.dates?.modified ?? fileData.dates?.created

    return (
      <div class="page-header-row">
        <div class="page-header-avatar">
          <a href={baseDir}>
            <img src={opts.imageUrl} alt="Author" width={opts.imageSize} height={opts.imageSize} />
          </a>
        </div>
        <div class="page-header-info">
          <h1 class="page-header-title">{title}</h1>
          <div class="page-header-meta">
            {date && (
              <time datetime={date.toISOString()}>
                {date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            )}
            {tags.length > 0 && (
              <span class="page-header-tags">
                {tags.map((tag) => (
                  <a href={`${baseDir}/tags/${tag}`} class="page-header-tag">
                    {tag}
                  </a>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  PageHeader.css = `
    .page-header-row {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .page-header-avatar {
      flex-shrink: 0;
      margin: 0;
    }
    .page-header-avatar img {
      border-radius: 50%;
      border: 2px solid var(--lightgray);
      display: block;
      margin: 0 !important;
      transition: border-color 0.2s;
    }
    .page-header-avatar img:hover {
      border-color: var(--gray);
    }
    .page-header-info {
      flex: 1;
      min-width: 0;
      margin-top: 1rem;
    }
    .page-header-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--dark);
      margin: 0 0 0.25rem 0;
      line-height: 1.3;
    }
    .page-header-meta {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.8rem;
      color: var(--gray);
    }
    .page-header-meta time {
      font-variant-numeric: tabular-nums;
    }
    .page-header-tags {
      display: flex;
      gap: 0.4rem;
    }
    .page-header-tag {
      color: var(--gray);
      text-decoration: none;
      transition: color 0.2s;
    }
    .page-header-tag::before {
      content: "[";
      opacity: 0.5;
    }
    .page-header-tag::after {
      content: "]";
      opacity: 0.5;
    }
    .page-header-tag:hover {
      color: var(--darkgray);
    }

    @media (max-width: 600px) {
      .page-header-row {
        gap: 1rem;
      }
      .page-header-avatar img {
        width: 60px !important;
        height: 60px !important;
      }
      .page-header-title {
        font-size: 1.25rem;
      }
    }
  `

  return PageHeader
}) satisfies QuartzComponentConstructor
