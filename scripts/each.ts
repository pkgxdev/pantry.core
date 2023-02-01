#!/usr/bin/env -S tea

/*---
dependencies:
  deno.land: ^1.30
args:
  - deno
  - run
  - --allow-run
  - --allow-read
  - --allow-env
---*/

const args = [...Deno.args]
const via = args.shift()

for (const arg of args) {
  const proc = Deno.run({
    stdout: "null", stderr: "null",
    cmd: [via!, arg]
  })
  const status = await proc.status()
  if (status.code !== 0) {
    console.error(`${arg} ❌`)
  } else {
    console.info(`${arg} ✅`)
  }
}
