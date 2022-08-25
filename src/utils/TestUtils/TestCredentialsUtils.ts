import { Credentials } from "./TestUtils";

export class TestCredentialsUtils {
  private name: Credentials["name"];
  private password: Credentials["password"];

  constructor(
    name: Credentials["name"],
    password: Credentials["password"] = "test-password"
  ) {
    this.name = `jest-test-${name}`;
    this.password = password;
  }

  public getCredentials(): Credentials {
    return { name: this.name, password: this.password };
  }
}
