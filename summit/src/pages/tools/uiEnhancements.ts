export function initUIEnhancements() {
  const summitUI = SummitUIEnhancements.getInstance();
  summitUI.HelpButton(UICaller.Page);
}

export enum UICaller {
  Init = "init",
  Page = "page",
  Fire = "fire",
}

export class SummitUIEnhancements {
  public helpButton: boolean = true;
  private static instance: SummitUIEnhancements;
  private constructor() {
    //get SummitUI settings JSON from local storage if exists
    const summitUI = localStorage.getItem("summitUI");
    if (summitUI) {
      const summitUIJSON = JSON.parse(summitUI);
      Object.assign(this, summitUIJSON);
    } else {
      this.helpButton = true;
    }
    this.HelpButton(UICaller.Init);
  }

  public HelpButton(caller: UICaller) {
    if (caller === UICaller.Page) {
      $("#helpbutton").on("click", () => this.HelpButton(UICaller.Fire));
      // set helpbutton to stored value
      $("#helpbutton").prop("checked", this.helpButton);
      return;
    }
    if (caller === UICaller.Fire) {
      this.helpButton = !this.helpButton;
      this.saveSettings();
    }
    if (this.helpButton) $("#freshworks-container").show();
    else $("#freshworks-container").hide();
  }

  public saveSettings() {
    localStorage.setItem("summitUI", JSON.stringify(this));
  }

  public static getInstance(): SummitUIEnhancements {
    if (!SummitUIEnhancements.instance) {
      SummitUIEnhancements.instance = new SummitUIEnhancements();
    }

    return SummitUIEnhancements.instance;
  }
}
