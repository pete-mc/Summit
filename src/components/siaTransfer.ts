import jquery from "jquery";

const SIA_EXPORT_BUTTON_CLASS = "summitSiaExportBtn";
const SIA_EXPORT_BUTTON_TEXT = "Summit Export";

function getAnchorButton(actionArea: JQuery<HTMLElement>): JQuery<HTMLElement> {
  return actionArea.find("button[data-cy*='VIEW'], button[data-cy*='EDIT'], button[data-cy*='REVIEW'], button").first();
}

function setClasses(button: JQuery<HTMLElement>, anchorButton: JQuery<HTMLElement>): void {
  button.removeClass().addClass(SIA_EXPORT_BUTTON_CLASS);
  button.addClass(anchorButton.attr("class") ?? "");
  button.addClass("summit-menu-outline");
}

function copyScopedAttributes(button: JQuery<HTMLElement>, anchorButton: JQuery<HTMLElement>): void {
  Array.from(anchorButton.get(0)?.attributes ?? []).forEach((attr) => {
    if (attr.name.startsWith("data-v-")) {
      button.attr(attr.name, "");
    }
  });
}

function createExportButton(actionArea: JQuery<HTMLElement>, anchorButton: JQuery<HTMLElement>): void {
  if (actionArea.find(`button.${SIA_EXPORT_BUTTON_CLASS}`).length > 0) return;

  const button = jquery("<button>", {
    text: SIA_EXPORT_BUTTON_TEXT,
    class: SIA_EXPORT_BUTTON_CLASS,
    "data-cy": "SUMMIT_EXPORT_SIA",
    click: () => {
      console.debug("SIA export payload is not implemented yet (Phase 2).");
    },
  });

  copyScopedAttributes(button, anchorButton);
  setClasses(button, anchorButton);
  anchorButton.before(button);
}

export function InitSiaTransfer(): void {
  jquery("div.ListItem__action-btn-col").each((_index, actionAreaElement) => {
    const actionArea = jquery(actionAreaElement);
    const anchorButton = getAnchorButton(actionArea);
    if (anchorButton.length === 0) return;

    createExportButton(actionArea, anchorButton);
  });
}
