import {
  Address,
  BigInt,
  Bytes,
  ethereum,
  store,
  log,
} from "@graphprotocol/graph-ts";
import { RawMessage, Retryable } from "../../generated/schema";
import { InboxMessageDelivered as InboxMessageDeliveredEvent } from "../../generated/Inbox/Inbox";
import { handleInboxMessageDelivered } from "../../src/mapping";

import {
  newMockEvent,
  test,
  assert,
  createMockedFunction,
} from "matchstick-as";

const RAW_ENTITY_TYPE = "RawMessage";
const RETRYABLE_ENTITY_TYPE = "Retryable";

const createNewMessage = (
  kind: string,
  messageNum: BigInt,
  data: Bytes
): InboxMessageDeliveredEvent => {
  let mockEvent = newMockEvent();

  if (kind != "Retryable")
    throw new Error("Currently only supports creating retryables");

  let rawMessage = new RawMessage(messageNum.toHexString());
  rawMessage.kind = kind;
  rawMessage.save();

  let parameters = new Array<ethereum.EventParam>();
  let messageNumParam = new ethereum.EventParam(
    "messageNum",
    ethereum.Value.fromI32(messageNum.toI32())
  );
  let dataParam = new ethereum.EventParam(
    "data",
    ethereum.Value.fromBytes(data)
  );
  parameters.push(messageNumParam);
  parameters.push(dataParam);

  let newInboxEvent = new InboxMessageDeliveredEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    parameters
  );

  return newInboxEvent;
};

const ethDeposit = Bytes.fromByteArray(
  Bytes.fromHexString(
    "0x00000000000000000000000097def9e0bd14fc70df700006e85babebfed271070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000012d00e28000000000000000000000000097def9e0bd14fc70df700006e85babebfed2710700000000000000000000000097def9e0bd14fc70df700006e85babebfed27107000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
  )
);

test("Specific offending retryableID calculation", () => {
  let messageNum = BigInt.fromI32(194961);

  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "retryableTicketID",
    "0xa7afd2ff94d9bf0c770401a4b8e08db68c099de9d7e4e559ebb8bbb23b98bc45"
  );
});

test("Specific offending retryableID calculation", () => {
  let messageNum = BigInt.fromI32(194899);

  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "retryableTicketID",
    "0xfc8b290392e86613f9831f914019634c5ec325c11b4c3682b2f6a1ec0d5eb837"
  );
});

test("Specific offending retryableID calculation", () => {
  let messageNum = BigInt.fromI32(194582);

  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "retryableTicketID",
    "0x6adddf5d70d15005a79cd58cdff5010925b1ba4958cbac6546b0d089f45ed591"
  );
});
test("Specific offending retryableID calculation", () => {
  let messageNum = BigInt.fromI32(194006);
  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "retryableTicketID",
    "0xb73790cdcdb745ac8fc51bbb2b7cc1c4e87b483ece4571ed0d102f034a927a0a"
  );
});
test("Specific offending retryableID calculation", () => {
  let messageNum = BigInt.fromI32(189033);
  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "retryableTicketID",
    "0xf109fa4554c897d98fc50384091a190346772db45f0e5d5a87bc04c9128dd20b"
  );
});
test("Specific offending retryableID calculation", () => {
  let messageNum = BigInt.fromI32(194894);
  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "retryableTicketID",
    "0xbe7d4b148f7c29a4d6322a02f6d087051c5e67b6780f868e99793821e8de71d6"
  );
});

test("Can mock and call function with different argument types", () => {
  let messageNum = BigInt.fromI32(1);
  // const tokenDepositData = Bytes.fromByteArray(Bytes.fromHexString("0x00000000000000000000000031d3fa5cb29e95eb50e8ad4031334871523e88f4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028f0815ec7670000000000000000000000000000000000000000000000000000000000012d00e28000000000000000000000000031d3fa5cb29e95eb50e8ad4031334871523e88f400000000000000000000000031d3fa5cb29e95eb50e8ad4031334871523e88f4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))
  const ethDeposit = Bytes.fromByteArray(
    Bytes.fromHexString(
      "0x00000000000000000000000097def9e0bd14fc70df700006e85babebfed271070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000012d00e28000000000000000000000000097def9e0bd14fc70df700006e85babebfed2710700000000000000000000000097def9e0bd14fc70df700006e85babebfed27107000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    )
  );
  let newInboxEvent1 = createNewMessage("Retryable", messageNum, ethDeposit);
  handleInboxMessageDelivered(newInboxEvent1);

  // the raw message gets removed
  // assert.fieldEquals(RAW_ENTITY_TYPE, messageNum.toHexString(), "kind", "Retryable")
  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "id",
    messageNum.toHexString()
  );
  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "isEthDeposit",
    "true"
  );

  // assert.fieldEquals()
  messageNum = messageNum.plus(BigInt.fromI32(1));
  const tokenDeposit2 = Bytes.fromByteArray(
    Bytes.fromHexString(
      "0x00000000000000000000000009E9222E96E7B4AE2A407B98D48E330053351EEE000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009AAD636F364A000000000000000000000000000000000000000000000000000002925554B6F6000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D20000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D20000000000000000000000000000000000000000000000000000000000001C345000000000000000000000000000000000000000000000000000000005649AD4400000000000000000000000000000000000000000000000000000000000002E42E567B36000000000000000000000000090185F2135308BAD17527004364EBCC2D37E5F6000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D20000000000000000000000000ED6D1DA67D18DF09F42C50E2C4E86370F58A8D2000000000000000000000000000000000000000000006EED54A68D4D70AF55AB000000000000000000000000000000000000000000000000000000000000000A000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001A0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000E0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000B5370656C6C20546F6B656E0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000055350454C4C000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000"
    )
  );
  let newInboxEvent2 = createNewMessage("Retryable", messageNum, tokenDeposit2);
  handleInboxMessageDelivered(newInboxEvent2);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "id",
    messageNum.toHexString()
  );
  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "isEthDeposit",
    "false"
  );

  messageNum = messageNum.plus(BigInt.fromI32(1));
  const tokenDeposit = Bytes.fromByteArray(
    Bytes.fromHexString(
      "0x000000000000000000000000096760f208390250649e3e8763348e783aef5562000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000025564458834fa00000000000000000000000000000000000000000000000000000156d198a8360000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b0000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b000000000000000000000000000000000000000000000000000000000006b6ee0000000000000000000000000000000000000000000000000000000058c5212e00000000000000000000000000000000000000000000000000000000000001442e567b36000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b0000000000000000000000002dd292297f6b1e84368d3683984f6da4c894eb3b00000000000000000000000000000000000000000000000000000001178bb88000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    )
  );
  let newInboxEvent3 = createNewMessage("Retryable", messageNum, tokenDeposit);
  handleInboxMessageDelivered(newInboxEvent3);

  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "id",
    messageNum.toHexString()
  );
  assert.fieldEquals(
    RETRYABLE_ENTITY_TYPE,
    messageNum.toHexString(),
    "isEthDeposit",
    "false"
  );

  let retrievedRetryable = Retryable.load(messageNum.toHexString());
  if (!retrievedRetryable) throw new Error("Null!");

  // can get values 2 different ways, with different typings
  // TODO: why is ethereum.Value different to Value
  let valGetter1 = retrievedRetryable.get("destAddr");
  if (!valGetter1) throw new Error("Null!!");

  let valGetter2 = retrievedRetryable.destAddr;
  if (!valGetter2) throw new Error("Null!!!");

  assert.equals(
    ethereum.Value.fromBytes(valGetter1.toBytes()),
    ethereum.Value.fromBytes(valGetter2)
  );

  // i love but i hate typing, there probably is a smarter way of doing this
  const expected = ethereum.Value.fromBytes(
    Bytes.fromByteArray(
      Address.fromHexString("0x096760f208390250649e3e8763348e783aef5562")
    )
  );
  assert.equals(expected, ethereum.Value.fromBytes(valGetter1.toBytes()));
});
