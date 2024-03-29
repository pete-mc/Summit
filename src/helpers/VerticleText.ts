export default function verticalText(text: string): string {
  let vertical = "";
  for (let i = 0; i < text.length; i++) {
    vertical += text[i] + "\n";
  }
  return vertical;
}
