![tea](https://tea.xyz/banner.png)

This pantry† represents the most essential open source packages in the world.
We promise to prioritize fixes, updates and robustness for these packages.
We will not lightly accept additions, and thus suggest submitting your pull
request against [pantry.extra] first.

> † see [pantry.zero] for “what is a pantry”

# Use with tea/cli

tea/cli clones/updates this pantry and [pantry.extra] when installed with the
installer or when you run `tea --sync`. At this time pantries are not
versioned.

# Contributing

See the contributing guide in [pantry.zero].

[pantry.zero]: https://github.com/teaxyz/pantry.zero#contributing
[pantry.extra]: https://github.com/teaxyz/pantry.extra

&nbsp;



# Tasks

The following can all be run with `xc`, eg. `xc init`.

## Init

Creates a new package at `./projects/wip/$RANDOM_TEA_BLEND/package.yml`.

```sh
tea -E +tea.xyz/brewkit init
```

## Edit

Opens all wip packages in `$EDITOR`.

```sh
tea -E +tea.xyz/brewkit edit
```

## Build

Builds all wip packages to `./tea.out`.

```sh
tea -E +tea.xyz/brewkit build
```

## Test

Tests all wip packages.

```sh
tea -E +tea.xyz/brewkit test
```


# Installing to `~/.tea`

You can move the contents of `tea.out` to `~/.tea` but this isn’t sufficient,
you also need the pantry entries.

So at this time we don’t have a *great* solution, but we’re working on it.
