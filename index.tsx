import { Elysia } from "elysia";
import { html, Html } from "@elysiajs/html";
import config from "./config.yaml";
import * as sass from "sass";

//
// utils
//

const resolve = (str: string): string => {
  if (!str) return str;

  return str.replace(/\{(\w+)\}/g, (_, varName) => {
    const value = VARS[varName];
    if (value === undefined) {
      console.warn(`Variable {${varName}} not found in config.vars`);
      return `{${varName}}`;
    }
    return resolve(value);
  });
};

//
// globals
//

const VARS = config.vars ?? {};
const ITEMS = (config.items ?? []).map((item: any) => {
  if (item.type === "category") {
    return {
      ...item,
      items: item.items.map((subItem: any) => ({
        ...subItem,
        url: resolve(subItem.url),
      })),
    };
  }
  return { ...item, url: resolve(item.url) };
});

// @ts-expect-error
const { default: rawStyles } = await import("./style.scss", {
  with: { type: "text" },
});

const { css: styles } = await sass.compileStringAsync(rawStyles);

//
// components
//

const Item = ({ name, url }: { name: string; url: string }) => {
  const _url = new URL(url);
  return (
    <a
      href={_url.toString()}
      target="_blank"
      rel="noopener noreferrer"
      class="item"
    >
      <div>{name}</div>
      <small>{_url.toString()}</small>
    </a>
  );
};

const Category = ({
  name,
  emoji,
  open,
  items,
}: {
  name: string;
  emoji: string;
  open: boolean;
  items: typeof ITEMS;
}) => (
  <details open={open}>
    <summary>
      {emoji && <span class="emoji">{emoji} </span>}
      {name}
    </summary>
    <ul class="list">
      {items.map((i: any) => (
        <li>
          <Item {...i} />
        </li>
      ))}
    </ul>
  </details>
);

const Search = ({
  placeholder,
  url,
  name = "q",
}: {
  placeholder: string;
  url: string;
  name: string;
}) => (
  <form action={url} method="GET" class="search">
    <input name={name} autofocus placeholder={placeholder} />
    <input type="submit" value="Search" />
  </form>
);

const HTML = ({ html }: { html: string }) => <>{html}</>;

const renderers: Record<string, (item: any) => any> = {
  default: (item) => <Item {...item} />,
  category: (item) => <Category {...item} />,
  search: (item) => <Search {...item} />,
  html: (item) => <HTML {...item} />,
};

//
// server
//

new Elysia()
  .use(html())
  .get("/", async ({ query }) => {
    return (
      <html lang="en">
        <head>
          <title>
            {config.name}
            {config.tagline && ` - ${config.tagline}`}
          </title>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {config.tagline && (
            <meta name="description" content={config.tagline} />
          )}
        </head>
        <body>
          <main id="ducky" style="max-width: 450px;">
            {config.message && (
              <aside
                id="message"
                style={{
                  background: "#999",
                  color: "#000",
                }}
              >
                {config.message}
              </aside>
            )}
            <header>
              <h1 id="title">{config.name}</h1>
              <hr />
              {config.tagline && <p id="tagline">{config.tagline}</p>}
              {config.description && (
                <>
                  <pre id="description">{config.description}</pre>
                  <hr />
                </>
              )}
            </header>
            {ITEMS.map((item: any) => {
              const render = renderers[item.type] ?? renderers.default;
              return render?.(item);
            })}

            <footer>
              <hr />
              Copyright &copy; 2025&ndash;2026 yarncat. No rights reserved.
            </footer>
          </main>
          {"min" in query ? (
            <style>{`a { margin: 0.5em 0; display: block; }`}</style>
          ) : (
            <style>{styles}</style>
          )}
        </body>
      </html>
    );
  })
  .listen(3000);
