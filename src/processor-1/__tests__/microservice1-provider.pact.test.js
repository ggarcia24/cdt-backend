const { messagePactWith } = require("jest-pact");

const { eventConsumer } = require("../handler");

const pactConfig = require("../../../test/contract/pact.config");

const {
  MessageConsumerPact,
  Matchers,
  synchronousBodyHandler,
} = require("@pact-foundation/pact");

messagePactWith(
  {
    ...pactConfig,
    provider: "cdt-microservice-1",
  },
  (messagePact) => {
    describe("processor-1", () => {
      it("process an event", () => {
        return messagePact
          .given("something happened on the other side")
          .expectsToReceive("a microservice 1 message")
          .withContent({
            id: Matchers.like(1),
            name: Matchers.like("rover"),
            type: Matchers.term({
              generate: "bulldog",
              matcher: "^(bulldog|sheepdog)$",
            }),
          })
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(eventConsumer));
      });
    });
  }
);
