export const getMilestoneLeadRequirement = (stage: number | undefined): number => {
  switch (stage) {
    case 1:
      return 2;
    case 2:
      return 4;
    case 3:
      return 6;
    default:
      return 0;
  }
};
