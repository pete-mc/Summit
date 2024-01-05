import { action, makeObservable, observable } from "mobx";
import { ServiceType } from "../constants/enums";
import { NuxtRouter } from "./nuxtRouter";
import { SummitService } from "../types/summitService";

export class Summit {
  public username: string;
  private static NuxtRouter: NuxtRouter = NuxtRouter.getInstance();
  private static Summit: SummitService = new Summit();

  private constructor() {
    this.username = "World";
    makeObservable(this, {
      username: observable,
      setUsername: action,
    });
  }

  public static getService<T extends SummitService>(type: ServiceType): T {
    const serviceMap: { [key in ServiceType]: SummitService } = {
      summit: this.Summit,
      nuxtRouter: this.NuxtRouter,
    };

    const serviceInstance = serviceMap[type];
    if (!serviceInstance) {
      throw new Error("Invalid service type");
    }

    return serviceInstance as T;
  }

  public setUsername(newState: string): void {
    this.username = newState;
  }
}

export default Summit;
