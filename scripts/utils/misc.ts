export function overlay_this_pantry() {
  const self = new URL(import.meta.url).path().parent().parent().parent().join("projects")

  Deno.env.set("TEA_PANTRY_PATH", self.string)
}
