import { Html } from "@elysiajs/html";

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
  items: unknown[];
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

export const renderers: Record<string, (item: any) => any> = {
  default: (item) => <Item {...item} />,
  category: (item) => <Category {...item} />,
  search: (item) => <Search {...item} />,
  html: (item) => <HTML {...item} />,
};