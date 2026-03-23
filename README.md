# ducky!

a minimal and hackable dashboard.

## installation

`Dockerfile` and `docker-compose.yaml` coming soon...

## configuration

the configuration file should be placed at `config.yaml`. an example is provided at `config.example.yaml`.

### `item`

```yaml
- name: github
  url: https://github.com
```

### `category`

```yaml
- type: category
  name: links
  emoji: 🔗
  open: true
  items:
    - name: google
      url: https://google.com
    - name: nekoweb
      url: https://nekoweb.org
    - name: discord
      url: https://discord.com
```

### `html`

```yaml
- type: html
  html: |
    <strong>this is bold</strong>
```

### `search`

```yaml
- type: search
  placeholder: Search using DuckDuckGo!
  url: https://duckduckgo.com/search
  name: q
```

## development

1. install dependencies
```
bun install
```
2. start dev server
```
bun run --hot .
```
