import { Elysia } from "elysia";
import { html, Html } from "@elysiajs/html";
import * as sass from "sass";
import fs from "fs/promises";
import z from "zod";
import { Config } from "./schemas";
import { renderers } from "./renderers";

//
// utils
//

const resolve = (VARIABLES: z.infer<typeof Config>['variables'], str: string): string => {
  if (!str || !VARIABLES) return str;

  return str.replace(/\{(\w+)\}/g, (_, varName) => {
    const value = VARIABLES[varName];
    if (value === undefined) {
      console.warn(`Variable {${varName}} not found in config.vars`);
      return `{${varName}}`;
    }
    return resolve(VARIABLES, value);
  });
};

const loadStyles = async () => {
  const raw = await fs.readFile("./config/style.scss", "utf-8");
  const { css } = await sass.compileStringAsync(raw);
  return css;
};

const loadConfig = async () => {
  const file = await fs.readFile("./config/config.yaml", "utf-8");
  return await Config.parseAsync(Bun.YAML.parse(file));
};

//
// server
//

new Elysia()
  .use(html())
  .get("/", async ({ query }) => {
    const config = await loadConfig();
    const styles = await loadStyles();

    console.log(config)

    const VARIABLES = config.variables ?? {};
    const ITEMS = (config.items ?? []).map((item: any) => {
      if (item.type === "category") {
        return {
          ...item,
          items: item.items.map((subItem: any) => ({
            ...subItem,
            url: resolve(VARIABLES, subItem.url),
          })),
        };
      }
      return { ...item, url: resolve(VARIABLES, item.url) };
    });

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
