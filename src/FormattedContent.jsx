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

export default function FormattedContent({ content, className = "resource-content" }) {
  return (
    <div className={className}>
      {String(content || "").split("\n").map((line, index) => {
        if (!line) return <span className="resource-content-space" key={index} aria-hidden="true" />;
        if (line.startsWith("## ")) return <h3 key={index}>{formatInlineText(line.slice(3).replace(/^# /, ""), `heading-${index}`)}</h3>;
        if (line.startsWith("### ")) return <h4 key={index}>{formatInlineText(line.slice(4), `subheading-${index}`)}</h4>;
        if (line.startsWith("- ")) return <p className="resource-list-item" key={index}><span aria-hidden="true">•</span>{formatInlineText(line.slice(2), `bullet-${index}`)}</p>;
        const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
        if (numbered) return <p className="resource-list-item" key={index}><span>{numbered[1]}.</span>{formatInlineText(numbered[2], `number-${index}`)}</p>;
        return <p key={index}>{formatInlineText(line, `paragraph-${index}`)}</p>;
      })}
    </div>
  );
}
