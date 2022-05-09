describe("Registration", () => {
  it("Should display input errors", () => {
    cy.fixture("testUser").then(testUser => {
      cy.task("db:deleteUser", testUser.name);
      cy.visit("/");
      cy.contains("Sign Up").click();
      cy.contains("Name has to be at least 4 characters long");
      cy.contains("Password has to be at least 6 characters long");
    });
  });

  it("Should successfully sign up", () => {
    cy.fixture("testUser").then(testUser => {
      cy.get("input[name=name]").type(testUser.name);
      cy.get("input[name=password]").type(testUser.password);
      cy.contains("Sign Up").click();
      cy.wait(3000);
    });
  });

  it("Should throw an error because such user already exists", () => {
    cy.fixture("testUser").then(testUser => {
      cy.contains("Sign Up").click();
      cy.contains("Such user already exists, try another name");
      cy.task("db:deleteUser", testUser.name);
    });
  });
});

export {};
