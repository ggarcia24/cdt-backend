const AWS = require("aws-sdk");
const { Verifier } = require("@pact-foundation/pact");
const { versionFromGitTag } = require("@pact-foundation/absolute-version");
const path = require("path");

AWS.config.apiVersions = {
  ssm: "2014-11-06",
  dynamodb: "2012-08-10",
};

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
});

const TABLE_NAME = "LocalDynamoTable";

const cleanDynamoDb = async () => {
  // Truncate is not available which means that I have to delete all the items
  // but this is fine because it's a local instance of DynamoDB so this is not
  // an expensive operation
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const results = await documentClient
    .scan({
      TableName: TABLE_NAME,
    })
    .promise();
  await results.Items.forEach(async (item, index) => {
    console.log(`Removing item #${index}: ${JSON.stringify(item)}`);
    await documentClient
      .delete({
        TableName: TABLE_NAME,
        Key: {
          id: item.id,
        },
      })
      .promise();
  });
};

const putDynamoDbItem = async (item) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const response = await documentClient
    .put({
      TableName: TABLE_NAME,
      Item: { ...item },
    })
    .promise();
};

// Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
  const opts = {
    provider: "cdt-backend",
    logLevel: "WARN",
    providerBaseUrl: "http://localhost:8081",
    requestFilter: (req, res, next) => {
      req.headers["x-api-key"] = "0123456789";
      next();
    },
    stateHandlers: {
      "some ToDos exist on the database": async () => {
        // Unfortunately I cannot use before each, I need to clear depending on
        // on the changes for the provider states which sounds not good at all
        await cleanDynamoDb();
        return putDynamoDbItem({
          id: "ce118b6e-d8e1-11e7-9296-cec278b6b50a",
          description: "iloveorange",
          completed: true,
          createdAt: "2022-01-02T00:01:00Z",
          updatedAt: "2022-01-02T00:01:00Z",
          dueDate: "2022-01-02T00:01:00Z",
        });
      },
    },
    pactBrokerUrl: "http://localhost:9292",
    pactBrokerUsername: "admin",
    pactBrokerPassword: "admin",
    consumerVersionTags: ["develop", "stage", "master"],
    providerVersionTags: ["develop"], // in real code, this would be dynamically set by process.env.GIT_BRANCH
    enablePending: true,
    publishVerificationResult: true,
    providerVersion: versionFromGitTag(),
  };

  it("validates the expectations of Matching Service", async () => {
    expect.assertions(1);

    let result;
    try {
      result = await new Verifier(opts).verifyProvider();
    } catch (error) {
      console.error("Error: " + error.message);
      process.exit(1);
    }
    console.log(result);

    // This should actually check if they were some failures to make it easy to see if the contracts failed
    expect(result).not.toBe("");
  });
});
