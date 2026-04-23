describe("jsdom environment availability", () => {
  it("provides document and window globals", () => {
    const element = document.createElement("div");
    element.id = "unit-test-node";
    document.body.appendChild(element);

    expect(window).toBeDefined();
    expect(document.getElementById("unit-test-node")).not.toBeNull();
  });
});
