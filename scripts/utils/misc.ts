import { usePrefix } from "hooks"

export async function overlay_this_pantry() {
  const pantry_prefix = usePrefix().join("tea.xyz/var/pantry")
  const self = new URL(import.meta.url).path().parent().parent().parent().join("projects")

  if (self.parent().eq(pantry_prefix)) return

  const to = pantry_prefix.join("projects")
  for await (const [path, {isFile}] of self.walk()) {
    if (isFile) {
      const dst = to.join(path.relative({ to: self }))
      path.cp({ into: dst.parent().mkpath() })
      console.log({ dst, path })
    }
  }
}
