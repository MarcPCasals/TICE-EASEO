import { Fragment } from "react";

const inlinePattern = /(\[violeta\][\s\S]*?\[\/violeta\]|\[taronja\][\s\S]*?\[\/taronja\]|\*\*[\s\S]*?\*\*|\*[\s\S]*?\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;

function formatInlineText(text, keyPrefix = "inline") {
  return text.split(inlinePattern).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("[violeta]") && part.endsWith("[/violeta]")) {
      return <span className="text-violet" key={key}>{formatInlineText(part.slice(9, -10), key)}</span>;
    }
    if (part.startsWith("[taronja]") && part.endsWith("[/taronja]")) {
      return <span className="text-orange" key={key}>{formatInlineText(part.slice(9, -10), key)}</span>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{formatInlineText(part.slice(2, -2), key)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{formatInlineText(part.slice(1, -1), key)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a href={link[2]} target="_blank" rel="noreferrer" key={key}>{link[1]}</a>;
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function renderLines(lines, keyPrefix) {
  return lines.map((line, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!line) return <span className="resource-content-space" key={key} aria-hidden="true" />;
    if (line.startsWith("## ")) return <h3 key={key}>{formatInlineText(line.slice(3).replace(/^# /, ""), `heading-${key}`)}</h3>;
    if (line.startsWith("### ")) return <h4 key={key}>{formatInlineText(line.slice(4), `subheading-${key}`)}</h4>;
    if (line.startsWith("- ")) return <p className="resource-list-item" key={key}><span aria-hidden="true">•</span><span>{formatInlineText(line.slice(2), `bullet-${key}`)}</span></p>;
    const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (numbered) return <p className="resource-list-item" key={key}><span>{numbered[1]}.</span><span>{formatInlineText(numbered[2], `number-${key}`)}</span></p>;
    return <p key={key}>{formatInlineText(line, `paragraph-${key}`)}</p>;
  });
}

function parseContent(content) {
  const lines = String(content || "").split("\n");
  const blocks = [];
  let plainLines = [];

  const flushPlainLines = () => {
    if (!plainLines.length) return;
    blocks.push({ type: "plain", lines: plainLines });
    plainLines = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const directive = lines[index].match(/^:::(summary|lead|quote|callout|details)(?:\s+([^|]+?))?(?:\|(.+))?$/);
    if (!directive) {
      plainLines.push(lines[index]);
      continue;
    }

    flushPlainLines();
    const body = [];
    index += 1;
    while (index < lines.length && lines[index] !== ":::") {
      body.push(lines[index]);
      index += 1;
    }
    blocks.push({
      type: directive[1],
      tone: directive[2]?.trim() || "violet",
      title: directive[3]?.trim() || "",
      lines: body,
    });
  }

  flushPlainLines();
  return blocks;
}

function ContentBlock({ block, index }) {
  const children = renderLines(block.lines, `block-${index}`);
  if (block.type === "summary") return <aside className="article-summary"><strong>Si només tens un minut</strong>{children}</aside>;
  if (block.type === "lead") return <div className="article-lead">{children}</div>;
  if (block.type === "quote") return <blockquote className="article-quote">{children}</blockquote>;
  if (block.type === "callout") return <aside className={`article-callout tone-${block.tone}`}>{block.title && <strong>{block.title}</strong>}{children}</aside>;
  if (block.type === "details") return (
    <details className={`article-details tone-${block.tone}`}>
      <summary><span>{block.title}</span></summary>
      <div className="article-details-body">{children}</div>
    </details>
  );
  return children;
}

export default function FormattedContent({ content, className = "resource-content" }) {
  return (
    <div className={className}>
      {parseContent(content).map((block, index) => <ContentBlock block={block} index={index} key={`${block.type}-${index}`} />)}
    </div>
  );
}
