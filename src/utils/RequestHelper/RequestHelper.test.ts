import { NextApiRequest } from "next";

import RequestHelper from "./RequestHelper";

const body = { foo: "bar" };

const mockRequestWtihGetMethod = { method: "GET" };
const mockRequestWtihPostMethod = {
  method: "POST",
  body: JSON.stringify(body)
};
const mockRequestWtihPutMethod = { method: "PUT" };
const mockRequestWtihDeleteMethod = { method: "DELETE" };

const requestHelperWithGetMethod = new RequestHelper(
  mockRequestWtihGetMethod as NextApiRequest
);
const requestHelperWithPostMethod = new RequestHelper(
  mockRequestWtihPostMethod as NextApiRequest
);
const requestHelperWithPutMethod = new RequestHelper(
  mockRequestWtihPutMethod as NextApiRequest
);
const requestHelperWithDeleteMethod = new RequestHelper(
  mockRequestWtihDeleteMethod as NextApiRequest
);

describe("RequestHelper class", () => {
  test("Should detect GET method", () => {
    expect(requestHelperWithGetMethod.isGET()).toBeTruthy();

    expect(requestHelperWithGetMethod.isPOST()).toBeFalsy();
    expect(requestHelperWithGetMethod.isPUT()).toBeFalsy();
    expect(requestHelperWithGetMethod.isDELETE()).toBeFalsy();
  });

  test("Should detect POST method", () => {
    expect(requestHelperWithPostMethod.isPOST()).toBeTruthy();

    expect(requestHelperWithPostMethod.isGET()).toBeFalsy();
    expect(requestHelperWithPostMethod.isPUT()).toBeFalsy();
    expect(requestHelperWithPostMethod.isDELETE()).toBeFalsy();
  });

  test("Should detect PUT method", () => {
    expect(requestHelperWithPutMethod.isPUT()).toBeTruthy();

    expect(requestHelperWithPutMethod.isGET()).toBeFalsy();
    expect(requestHelperWithPutMethod.isPOST()).toBeFalsy();
    expect(requestHelperWithPutMethod.isDELETE()).toBeFalsy();
  });

  test("Should detect DELETE method", () => {
    expect(requestHelperWithDeleteMethod.isDELETE()).toBeTruthy();

    expect(requestHelperWithDeleteMethod.isGET()).toBeFalsy();
    expect(requestHelperWithDeleteMethod.isPOST()).toBeFalsy();
    expect(requestHelperWithDeleteMethod.isPOST()).toBeFalsy();
  });

  test("Should successfully extract data out of body", () => {
    expect(requestHelperWithPostMethod.getBody()).toEqual(body);
  });
});
