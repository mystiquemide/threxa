export function Footer() {
  return (
    <footer className="border-t border-fogline py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 font-mono text-xs text-fog-soft">
        <span>threxa - blast-radius agent for data model PRs</span>
        <a
          href="https://github.com/mystiquemide/threxa"
          className="hover:text-fog"
          target="_blank"
          rel="noreferrer"
        >
          github.com/mystiquemide/threxa
        </a>
      </div>
    </footer>
  )
}
