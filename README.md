# Foam + Raito Wiki

> Your personal knowledge graph — powered by [Foam](https://foambubble.github.io/foam/), [Raito](https://raito.io/).

## Quick Start

1. Clone or open this folder in **VS Code** with the Foam extension installed.
2. Install dependencies:  

    ```sh

    just setup

    ```

3. Preview locally:  

    ```sh
    just serve
    ```

4. Start writing `.md` notes and linking them with `[wikilinks](wikilinks.md)`.

## What is Foam?

Foam is a personal knowledge management system inspired by Roam Research, built on VS Code and GitHub. Notes live as plain Markdown files you own forever.

## What is Raito?

Raito is a data access management platform that helps you manage and govern access to your data resources efficiently.

## Structure

| Folder      | Purpose                 |
| ----------- | ----------------------- |
| `daily/`    | Daily notes & journals  |
| `projects/` | Project-specific notes  |
| `topics/`   | Evergreen concept notes |
| `inbox.md`  | Unsorted capture zone   |

## Example Wikilink

This note links to [foam-guide](foam-guide.md) and [about](about.md).

## justfile Commands

| Command      | Description                       |
| ------------ | --------------------------------- |
| `just setup` | Install dependencies              |
| `just serve` | Serve the site locally            |
| `just build` | Build static site (if applicable) |

---

Last updated: {{date}}
