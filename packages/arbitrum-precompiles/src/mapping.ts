import { L2ToL1Transaction as L2ToL1TransactionEvent } from "../generated/ArbSys/ArbSys";
import { L2ToL1Transaction, Retryable, Withdraw } from "../generated/schema";
import {
  Canceled as CanceledEvent,
  LifetimeExtended as LifetimeExtendedEvent,
  Redeemed as RedeemedEvent,
  TicketCreated as TicketCreatedEvent,
  CreateRetryableTicketCall,
} from "../generated/ArbRetryableTx/ArbRetryableTx";
import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { RETRYABLE_LIFETIME_SECONDS } from "subgraph-common/src/helpers";

export function handleL2ToL1Transaction(event: L2ToL1TransactionEvent): void {
  // TODO: make the uniqueId the actual ID
  let entity = new L2ToL1Transaction(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.caller = event.params.caller;
  entity.destination = event.params.destination;
  entity.uniqueId = event.params.uniqueId;
  entity.batchNumber = event.params.batchNumber;
  entity.indexInBatch = event.params.indexInBatch;
  entity.arbBlockNum = event.params.arbBlockNum;
  entity.ethBlockNum = event.params.ethBlockNum;
  entity.timestamp = event.params.timestamp;
  entity.callvalue = event.params.callvalue;
  entity.data = event.params.data;

  if (entity.data.toHexString().slice(0, 10) == "0x2e567b36") {
    // Function: finalizeInboundTransfer(address l1Token, address from, address to, uint256 amount, bytes) ***
    let parameterData = Bytes.fromUint8Array(entity.data.slice(4));
    let callDataDecoded = ethereum.decode(
      "(address,address,address,uint256)",
      parameterData
    );

    if (callDataDecoded) {
      const parsedArrayCallData = callDataDecoded.toTuple();

      let withdraw = new Withdraw(entity.id);
      withdraw.l1Token = parsedArrayCallData[0].toAddress();
      withdraw.from = parsedArrayCallData[1].toAddress();
      withdraw.to = parsedArrayCallData[2].toAddress();
      withdraw.amount = parsedArrayCallData[3].toBigInt();
      withdraw.l2Tol1Txn = entity.id;

      withdraw.save();
    }
  }

  // TODO: query for L2 to L1 tx proof
  // TODO: don't make this an archive query
  // this will either be the proof or null
  // if not null, backfill previous ones that were null

  entity.save();
}

export function handleCanceled(event: CanceledEvent): void {
  let entity = Retryable.load(event.params.userTxHash.toHexString());
  if (!entity) {
    log.critical("Missed a retryable ticket somewhere!", []);
    throw new Error("No retryable ticket");
  }
  entity.status = "Canceled";
  entity.save();
}

export function handleLifetimeExtended(event: LifetimeExtendedEvent): void {
  let entity = Retryable.load(event.params.userTxHash.toHexString());
  if (!entity) {
    log.critical("Missed a retryable ticket somewhere!", []);
    throw new Error("No retryable ticket");
  }
  entity.timeoutTimestamp = entity.timeoutTimestamp.plus(
    event.params.newTimeout
  );
  entity.save();
}

export function handleRedeemed(event: RedeemedEvent): void {
  let entity = Retryable.load(event.params.userTxHash.toHexString());
  Retryable.load;
  if (!entity) {
    log.critical("Missed a retryable ticket somewhere!", []);
    throw new Error("No retryable ticket");
  }
  // TODO: we can compare hash(retryableTicketID, 1) to redeemTxId to infer if this was an auto redeem or not
  entity.redeemTxId = event.transaction.hash;
  entity.status = "Redeemed";
  entity.save();
}

export function handleTicketCreated(event: TicketCreatedEvent): void {
  let entity = new Retryable(event.params.userTxHash.toHexString());
  // could query the precompile at `getLifetime()` but we don't need the expensive archive query
  entity.timeoutTimestamp = event.block.timestamp.plus(
    RETRYABLE_LIFETIME_SECONDS
  );
  entity.retryableTicketID = event.transaction.hash;
  entity.status = "Created";
  entity.save();
}
