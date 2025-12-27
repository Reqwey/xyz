import { header } from '../../config.json'

export function GitHubIconButton() {
  return (
    <a
      className="size-9 rounded-full shadow-lg shadow-zinc-800/5 border border-primary bg-white/50 dark:bg-zinc-800/50 backdrop-blur flex justify-center items-center"
      type="button"
      aria-label="Search"
      href={header.repoLink}
			rel="noopener noreferrer"
			target="_blank"
    >
      <i className="iconfont icon-github"></i>
    </a>
  )
}
