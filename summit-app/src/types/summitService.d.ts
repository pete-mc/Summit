import { Summit, NuxtRouter } from "../services/servicesIndex";

type SummitService = Summit | NuxtRouter;

type ServiceTypeMap = {
  summit: typeof Summit;
  nuxtRouter: typeof NuxtRouter;
};
