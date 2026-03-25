import { QuartzTransformerPlugin } from "../types"

interface Options {
  dsVersion: string
}

const defaultOptions: Options = {
  dsVersion: "1.0.0-RC.8",
}

export const DatastarLoader: QuartzTransformerPlugin<Options> = (opts?) => {
  const dsVersion = opts?.dsVersion ?? defaultOptions.dsVersion
  const dsCdnUrl = `https://cdn.jsdelivr.net/gh/starfederation/datastar@${dsVersion}/bundles/datastar.js`

  return {
    name: "DatastarLoader",
    externalResources() {
      return {
        additionalHead: [
          <script
            type="importmap"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({ imports: { datastar: dsCdnUrl } }),
            }}
          />,
          <script type="module" dangerouslySetInnerHTML={{ __html: 'import "datastar"' }} />,
        ],
      }
    },
  }
}
