import { pathToRoot } from "../util/path"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  imageUrl: string
  size: number
}

const defaultOptions: Options = {
  imageUrl: "https://github.com/ndendic.png",
  size: 80,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function AuthorAvatar({ fileData }: QuartzComponentProps) {
    const baseDir = pathToRoot(fileData.slug!)
    return (
      <div class="author-avatar">
        <a href={baseDir}>
          <img src={opts.imageUrl} alt="Author avatar" width={opts.size} height={opts.size} />
        </a>
      </div>
    )
  }

  AuthorAvatar.css = `
    .author-avatar {
      flex-shrink: 0;
      margin: 0;
    }
    .author-avatar img {
      border-radius: 50%;
      border: 2px solid var(--lightgray);
      transition: border-color 0.2s;
      display: block;
    }
    .author-avatar img:hover {
      border-color: var(--gray);
    }
  `

  return AuthorAvatar
}) satisfies QuartzComponentConstructor
