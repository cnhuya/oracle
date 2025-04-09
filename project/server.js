const express = require('express');
const cors = require('cors');
const{ HexString, SupraAccount, SupraClient, BCS, TxnBuilderTypes } = require("supra-l1-sdk");
const { serialize } = require('v8');
const https = require('https');



async function getPriceBybit(krypto) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hermes.pyth.network',
      //path: `/v5/market/tickers?category=spot&symbol=${krypto}USDT`,
      path: `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43&ids%5B%5D=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace&ids%5B%5D=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`,
      
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/18.0', // Required by many APIs
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log(data);
          const parsedData = JSON.parse(data);
          console.log(parsedData);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.end();
  });
}

const secret_key = process.env.SUPRA_SECRET_KEY;

const newClient = new SupraClient("https://rpc-testnet.supra.com", 6);
const senderAddr = new SupraAccount();

// docs 
// https://docs.supra.com/move/typescript-sdk

let validator = new SupraAccount(
  Buffer.from(
    secret_key,
    "hex"
  )
);

console.log("this is a secret key");
console.log(secret_key);
console.log("this is admin");
console.log(validator);

const contractAddress = "0xc698c251041b826f1d3d4ea664a70674758e78918938d1b3b237418ff17b4020";
const bufferToSign = new Uint8Array([21]);
const types = TxnBuilderTypes;

//debuging
console.log("senderAddr:", senderAddr);
console.log("contractAddress:", contractAddress);




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


let TX;

async function execute() {
    try {
        console.log(senderAddr);
        if (!TX) {
            throw new Error("Transaction not initialized. Call fetchPrice() first.");
        }

        let supraCoinTransferRawTransactionSerializer1 = new BCS.Serializer();
        TX.serialize(supraCoinTransferRawTransactionSerializer1);
        
        const result = await newClient.sendTxUsingSerializedRawTransaction(
            senderAddr,
            supraCoinTransferRawTransactionSerializer1.getBytes()
            /* {
                enableWaitForTransaction: true,
                enableTransactionSimulation: true,
            }*/
        );
        console.log("Transaction result:", result);
    } catch (error) {
        console.error("Error in execute:", error);
        throw error;
    }
}

async function fetchPrice(krypto) {
    try {
        console.log(senderAddr.address().toUint8Array());
        let module_name;
        let decimals;
        switch(krypto){
          case "BTC":
              module_name = "BitcoinOracle";
              decimals = 1;
              number_in_list = 0;
              break;
          case "ETH":
              module_name = "EthereumOracle";
              decimals = 2;
              number_in_list = 1;
              break;
          case "SOL":
              module_name = "SolanaOracle";
              decimals = 3;
              number_in_list = 2;
              break;
        }

        let data = await getPriceBybit(krypto);
        //let lastPrice = data.result.list[0].lastPrice;
        let priceData = data.parsed[number_in_list].price;
        let correct_lastPrice = parseFloat(priceData.price) * Math.pow(10, priceData.expo);
        console.log("Last price:", correct_lastPrice);

        // Convert price to proper format for BCS serialization
        const priceValue = parseFloat(correct_lastPrice);
        if (isNaN(priceValue)) {
            throw new Error("Invalid price value received");
        }

        // Multiply by 10 and round to nearest integer for BigInt conversion
        const scaledPrice = Math.round(priceValue *  Math.pow(10,decimals));
        //const priceForBcs = BCS.bcsSerializeUint64(BigInt(scaledPrice));

        let initialTX = await newClient.createRawTxObject(
          validator.address(),
            (await newClient.getAccountInfo(validator.address())).sequence_number,
            contractAddress,
            module_name,
            "storeDATA",
            [],
            [BCS.bcsSerializeUint64(scaledPrice)]
        );
        
        console.log("Initial TX:", initialTX);
        TX = initialTX;
        return TX;
    } catch (error) {
        console.error("Error in fetchPrice:", error);
        throw error;
    }
}

let intervalID;

// Example usage:

async function start() {
  try {
   // jiz neni potreba, jelikoz vyuzivam importovanou jiz existuji adresu, takze uz nevytvarim novou
   // tento krok byl nejspis nutny, jelikoz render obraz restartuje servery (nejspis?, potreba vic otestovat?) - a musel bych ihned nastavit novou adresu validatora... (coz je nemozne)
   // proto jsem tedy musel implementovat jiz existujici adresu.
   // await fundAccount();
    await sleep(1000);
    setInterval(main, 60000)
  } catch (error) {
      console.error("Main execution error:", error);
    }  
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

start();

async function main() {
    try {
        await fetchPrice("BTC");
        await execute();
        await sleep(10000);
        await fetchPrice("ETH");
        await execute();
        await sleep(10000);
        await fetchPrice("SOL");
        await execute();
    } catch (error) {
        console.error("Main execution error:", error);
    }
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
      const data = await main();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }); 

  app.get('/start', async (req, res) => {
    try {
      const data = await start();
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
  start();
});
