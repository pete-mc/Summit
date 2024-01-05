import { ServiceType } from "../../constants/enums";
import { Summit } from "../summit";

describe("SummitContext", () => {
  let summitContext: Summit;

  beforeEach(() => {
    summitContext = Summit.getService(ServiceType.Summit);
  });

  afterEach(() => {
    summitContext.setUsername("World"); // Reset the username after each test
  });

  it("should set the username correctly", () => {
    summitContext.setUsername("John");
    expect(summitContext.username).toBe("John");
  });
});
