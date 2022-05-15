function clearForm() {
  cy.get("input[name=name]").clear();
  cy.get("input[name=password]").clear();
}

describe("Authorization", () => {
  it("Should successfully sign up", () => {
    cy.fixture("testUser").then(testUser => {
      cy.task("db:deleteUser", testUser.name);
      cy.visit("/");
      cy.get("input[name=name]").type(testUser.name);
      cy.get("input[name=password]").type(testUser.password);
      cy.contains("Sign Up").click();
      cy.get("a").click();
      cy.wait(3000);
      cy.contains("Belo Chat");
    });
  });

  it("Should throw an error because of the incorrect password", () => {
    cy.fixture("testUser").then(testUser => {
      cy.visit("/");
      clearForm();
      cy.get("a").click();
      cy.get("input[name=name]").type(testUser.name);
      cy.get("input[name=password]").type("123456789");
      cy.contains("Sign In").click();
      cy.contains("Password is not correct");
    });
  });

  it("Should throw an error because of the incorrect user name", () => {
    cy.fixture("testUser").then(testUser => {
      clearForm();
      cy.get("input[name=name]").type("123456789");
      cy.get("input[name=password]").type(testUser.password);
      cy.contains("Sign In").click();
      cy.contains("Such user doesn't exist");
    });
  });

  it("Should reveal and hide password", () => {
    clearForm();
    cy.get("input[name=password]").should("have.attr", "type", "password");
    cy.get("input[name=password] ~ div > button").click();
    cy.get("input[name=password]").should("have.attr", "type", "text");
    cy.get("input[name=password] ~ div > button").click();
    cy.get("input[name=password]").should("have.attr", "type", "password");
  });

  it("Should successfully sign in", () => {
    cy.fixture("testUser").then(testUser => {
      clearForm();
      cy.get("input[name=name]").type(testUser.name);
      cy.get("input[name=password]").type(testUser.password);
      cy.contains("Sign In").click();
      cy.wait(3000);
      cy.contains("Belo Chat");
      cy.task("db:deleteUser", testUser.name);
    });
  });
});

export {};
