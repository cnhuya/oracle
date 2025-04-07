const express = require('express');
const cors = require('cors');
const{ HexString, SupraAccount, SupraClient, BCS, TxnBuilderTypes } = require("supra-l1-sdk");
const { serialize } = require('v8');


const newClient = new SupraClient("https://rpc-testnet.supra.com", 6);
const senderAddr = new SupraAccount();
//const receiver = new HexString(receiverAddr); // remove this, not needed anymore.
// the address of the contract whose function is being invoked
const contractAddress = "0xc698c251041b826f1d3d4ea664a70674758e78918938d1b3b237418ff17b4020";
const bufferToSign = new Uint8Array([21]);
const types = TxnBuilderTypes;

//debuging
console.log("senderAddr:", senderAddr);
console.log("contractAddress:", contractAddress);

const high = BCS.bcsSerializeStr("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. N");
console.log("THIS IS A SERIALIZED STRING")
console.log(high);


let TX;
let initial_TX;

console.log("buffer to sign:", bufferToSign)

let xa = {
    Ed25519: {
        public_key: senderAddr.pubKey().toString(),
        signature: senderAddr.signBuffer(bufferToSign).toString()
    }
};





console.log("xa??", xa);

async function fundAccount(){
    let fund = await newClient.fundAccountWithFaucet(senderAddr.address())

    let balance = await newClient.getAccountSupraCoinBalance(senderAddr.address())

    console.log("FZND", fund);
    console.log("BALANCS", balance);
    console.log("SENDERAD", senderAddr);

    const test = types.TypeTagU128;
    console.log("this is a type of typetag128",test);

    return fund;
}




async function initialize(){
  console.log(senderAddr);
  console.log(initial_TX);

  let supraCoinTransferRawTransactionSerializer = new BCS.Serializer();

  initial_TX.serialize(
   supraCoinTransferRawTransactionSerializer
 );
 console.log(
   await newClient.sendTxUsingSerializedRawTransaction(
     senderAddr,
     supraCoinTransferRawTransactionSerializer.getBytes(),
    /* {
       enableWaitForTransaction: true,
       enableTransactionSimulation: true,
     }*/
   )
 );
   console.log("simulation: ", initialize)
}


async function executejson(){
  console.log(senderAddr);
  console.log(jsonStr);

  let supraCoinTransferRawTransactionSerializer2 = new BCS.Serializer();

  jsonStr.serialize(
    supraCoinTransferRawTransactionSerializer2
  );
  console.log(
    await newClient.sendTxUsingSerializedRawTransaction(
      senderAddr,
      supraCoinTransferRawTransactionSerializer2.getBytes(),
     /* {
        enableWaitForTransaction: true,
        enableTransactionSimulation: true,
      }*/
    )
  );

   console.log("simulation: ", executejson)
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function execute(){
   console.log(senderAddr);
   console.log(TX);

   let supraCoinTransferRawTransactionSerializer1 = new BCS.Serializer();

   TX.serialize(
    supraCoinTransferRawTransactionSerializer1
   );
   console.log(
     await newClient.sendTxUsingSerializedRawTransaction(
       senderAddr,
       supraCoinTransferRawTransactionSerializer1.getBytes(),
      /* {
         enableWaitForTransaction: true,
         enableTransactionSimulation: true,
       }*/
     )
   );
 
    console.log("simulation: ", execute)
}

async function createjson(_gameid, _json) {


  console.log(senderAddr.address().toUint8Array())
  const receiverAddress = new SupraAccount();
  const ADDR = receiverAddress.address();



  let supraCoinTransferRawTransaction = await newClient.createRawTxObject(
    senderAddr.address(),
    (
      await newClient.getAccountInfo(senderAddr.address())
    ).sequence_number,
    contractAddress,
    "league4",
    "set_LANE2",
    [],
    [BCS.bcsSerializeU256(_gameid) , BCS.bcsSerializeStr(_json)]
  );
  jsonStr = supraCoinTransferRawTransaction;
  console.log("not await", TX);

}





async function createOHCLTX() {




  const test1 = types.TypeTagU16;
  console.log("this is a type of typetag16",test1);

  console.log(senderAddr.address().toUint8Array())
  const receiverAddress = new SupraAccount();
  const ADDR = receiverAddress.address();
  // Create the serialized raw transaction



  let supraCoinTransferRawTransaction = await newClient.createRawTxObject(
    senderAddr.address(),
    (
      await newClient.getAccountInfo(senderAddr.address())
    ).sequence_number,
    contractAddress,
    "numba9",
    "numbas",
    [],
    [BCS.bcsSerializeUint64(10000) , BCS.bcsSerializeUint64(500)]
  );
  TX = supraCoinTransferRawTransaction;
  console.log("not await", TX);

}




async function createAndExecuteTransaction() {

    const high = 5;

    const regularString = "string";
    const hexString = new HexString("string"); // "0xstring"
    console.log("hexString", hexString);
    //hexString.toUint8Array();
    //console.log("HEDSTRING TO UINT8ARRAY", hexString.toString());

    const serializedHigh = BCS.bcsSerializeU16(high); // Assuming 'high' is U16
    console.log(" SERIALIZED ",serializedHigh);


    const test1 = types.TypeTagU16;
    console.log("this is a type of typetag16",test1);

    console.log(senderAddr.address().toUint8Array())
    const receiverAddress = new SupraAccount();
    const ADDR = receiverAddress.address();
    // Create the serialized raw transaction

    let initialTX = await newClient.createRawTxObject(
      senderAddr.address(),
      (
        await newClient.getAccountInfo(senderAddr.address())
      ).sequence_number,
      contractAddress,
      "numba9",
      "initiallize",
      [],
      []
    );

    initial_TX = initialTX;
    console.log("initialTX", initialTX);
  }

async function viewOhcl(number) {

  const functionFullname =
    "0xc698c251041b826f1d3d4ea664a70674758e78918938d1b3b237418ff17b4020::priary::view_OHCL";
  const typeArguments = [];
  const functionArguments = [
    "0xc698c251041b826f1d3d4ea664a70674758e78918938d1b3b237418ff17b4020",
    number.toString(),
  ];

  try {
    const result = await newClient.invokeViewMethod( // use newClient
      functionFullname,
      typeArguments,
      functionArguments
    );
    console.log("View result:", result);
    return result;
  } catch (error) {
    console.error("Error calling view function:", error);
    throw error;
  }
}


const app = express();
const port = 3000;
app.use(cors());
app.use(express.static('public'));




app.get('/fund', async (req, res) => {
    try {
      const data = await fundAccount();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });

  app.get('/REAL', async (req, res) => {
    try {
      const data = await execute();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }); 
  app.get('/REALOHCL', async (req, res) => {
    try {
      const data = await createOHCLTX();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }); 

  app.get('/INITIALIZE', async (req, res) => {
    try {
      const data = await initialize();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }); 

app.get('/execute', async (req, res) => {
    try {
      const data = await createAndExecuteTransaction();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });


  app.get('/multi', async (req, res) => {
    try {
      const data = await TRIPLETEST();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });

  app.get('/view-ohcl/:gameID/:json', async (req, res) => {
    try {
      const gameID = parseInt(req.params.gameID, 10);
      const json = req.params.json == null ? "" : String(req.params.json);
      if (isNaN(gameID)) {
        res.status(400).json({ error: "Invalid 'number' parameter. Must be an integer." });
        return;
      }
      
      const data = await createjson(gameID, json); // Changed "number" to "gameID", and added json as a variable
      res.json({ data: data });
  
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });
  

  app.get('/executejson', async (req, res) => {
    try {
      const data = await executejson();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });


app.get('/view-ohcl/:number', async (req, res) => {
  try {
    const number = parseInt(req.params.number, 10);
    if (isNaN(number)) {
      res.status(400).json({ error: "Invalid 'number' parameter. Must be an integer." });
      return;
    }
    

    const data = await viewOhcl(number);
    res.json({ data: data });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
