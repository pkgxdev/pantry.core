![tea](https://tea.xyz/banner.png)

<h1 align="center">tea/<strong>pantry.core</strong></h1>
<p align="center">
  tea is a decentralized, universal package manager that puts the entire open source ecoystem at your fingertips. This requires a decentralized package registry. Our pantries are our tentative first step towards that goal.
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>
&nbsp;

# Introduction

This pantry† represents the most essential open source packages in the world.
We promise to prioritize fixes, updates and robustness for these packages.
We will not lightly accept additions, and thus suggest submitting your pull
request against [pantry.extra] first.

> † see [pantry.zero] for “what is a pantry”

# Use with tea/cli

[tea/cli] clones/updates this pantry and [pantry.extra] when installed with the
installer or when you run `tea --sync`. At this time pantries are not
versioned.

## Example
This example downloads our white paper and renders it with charm’s excellent glow terminal markdown renderer. Both packages `gnu.org/wget` and `charm.sh/glow` are present in [pantry.core] (this repo) and [pantry.extra], respectively. 
```sh
tea +gnu.org/wget wget -qO- tea.xyz/white-paper | tea +charm.sh/glow glow -
```

# Contributing

See the contributing guide in [pantry.zero].


&nbsp;


# Meta
## Dependencies

|   Project   | Version |
|-------------|---------|
| deno.land   | ^1.27   |
| tea.xyz     | ^0      |

## Build All

```sh
scripts/ls.ts | scripts/sort.ts | scripts/build.ts
```

## Typecheck

```sh
for x in scripts/*.ts src/app.ts; do
  deno check --unstable --import-map=$SRCROOT/import-map.json $x
done
```

[pantry.zero]: https://github.com/teaxyz/pantry.zero#contributing
[pantry.core]: https://github.com/teaxyz/pantry.core
[pantry.extra]: https://github.com/teaxyz/pantry.extra
[tea/cli]: https://github.com/teaxyz/cli
