import { HexString, SupraAccount, SupraClient, BCS, TxnBuilderTypes } from "supra-l1-sdk";
import { deserialize, Deserializer, serialize, Serializer } from "v8";

const newClient = new SupraClient("https://rpc-testnet.supra.com", 6);
const senderAddr = new SupraAccount();
const receiverAddr = new SupraAccount();
const receiverAddress = receiverAddr.address();
const types = TxnBuilderTypes;

const contractAddress = "0xc698c251041b826f1d3d4ea664a70674758e78918938d1b3b237418ff17b4020";
const x = new Uint8Array([21, 31, 20, 8]);

  let sequence_number = (await newClient.getAccountInfo(senderAddr.address())).sequence_number;

  const bufferToSign = new Uint8Array([0, 1, 2, 3, 4, 5]);
  const reader = new BCS.Deserializer(bufferToSign); // Create a reader from the serialized data
 let xy = BCS.bcsSerializeU16(100);
 let yy = 100;
  let xa = { 
      Ed25519: {
          public_key: senderAddr.pubKey().toString(),
          signature: senderAddr.signBuffer(bufferToSign).toString() 
      }
  };
  const serializedBuffer = serialize(bufferToSign);

  const time = 1111;
  const open = 1114451;
  const high = 100;
  const low = 1111;
  const close = 1111;

  // BCS serialize each argument individually
  const serializedTime = BCS.bcsSerializeU32(time);
  const serializedOpen = BCS.bcsSerializeU32(open);
  const serializedHigh = BCS.bcsSerializeU16(high); // Assuming 'high' is U16
  const serializedLow = BCS.bcsSerializeU32(low);
  const serializedClose = BCS.bcsSerializeU32(close);

  // Create the array of BCS-serialized arguments (Uint8Array[])
  const functionArgs = new Uint8Array(
  );

  const test = types.TypeTagU128;
  console.log(test);

  const regularString = "string";
  const hexString = new HexString("string"); // "0xstring"

  hexString.toUint8Array();

  // Create the serialized raw transaction
  let supraCoinTransferRawTransaction = await newClient.createSerializedRawTxObject(
      senderAddr.address(),
      (await newClient.getAccountInfo(senderAddr.address())).sequence_number, BCS.bcsSerializeU16 BCS.bcsSerializeU32
      contractAddress,
      "priary",
      "set_OHCL",
      [], // type arguments
      [functionArgs HexString], // function arguments
      {
      } 
  );

  let execute = await newClient.sendTxUsingSerializedRawTransaction(senderAddr, supraCoinTransferRawTransaction,
    {
    enableTransactionSimulation: true,
    enableWaitForTransaction: true,
  });
  console.log("simulation: ", execute)