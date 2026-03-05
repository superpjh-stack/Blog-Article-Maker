import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const noImages = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  const parts = noImages.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else {
      const cleaned = part
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1");
      if (cleaned) runs.push(new TextRun({ text: cleaned }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: "" })];
}

export async function downloadAsWord(content: string, topic: string) {
  const paragraphs: Paragraph[] = [];

  for (const line of content.split("\n")) {
    if (line.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 })
      );
    } else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 })
      );
    } else if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 })
      );
    } else if (line.startsWith("- ")) {
      paragraphs.push(
        new Paragraph({ children: parseInline(line.slice(2)), bullet: { level: 0 } })
      );
    } else if (line.startsWith("![") || line.trim() === "") {
      paragraphs.push(new Paragraph({ text: "" }));
    } else {
      paragraphs.push(new Paragraph({ children: parseInline(line) }));
    }
  }

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${topic.slice(0, 40).replace(/\s+/g, "-")}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

function markdownToHtml(md: string): string {
  return md
    .replace(
      /^!\[([^\]]*)\]\(([^)]+)\)\n\*([^*]+)\*$/gm,
      '<figure><img src="$2" alt="$1" style="max-width:100%;border-radius:8px"/><figcaption style="font-size:12px;color:#888;text-align:center;margin-top:4px">$3</figcaption></figure>'
    )
    .replace(
      /^!\[([^\]]*)\]\(([^)]+)\)$/gm,
      '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px"/>'
    )
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[huilfp])(.+)$/gm, "<p>$1</p>");
}

export async function copyForNaverBlog(content: string): Promise<void> {
  const html = markdownToHtml(content);
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([content], { type: "text/plain" }),
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(content);
  }
}
