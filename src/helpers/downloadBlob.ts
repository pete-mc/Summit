export default function downloadBlob(content: string, fileName: string, contentType: string, attachTarget?: HTMLElement): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const container = attachTarget ?? document.body;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    container.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
