const express = require('express');
const cors = require('cors');
const{ HexString, SupraAccount, SupraClient, BCS, TxnBuilderTypes } = require("supra-l1-sdk");
const { serialize } = require('v8');
const https = require('https');


async function Nothing(){
  return 1;
}


async function getPriceBybit() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hermes.pyth.network',
      path: `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43&ids%5B%5D=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace&ids%5B%5D=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`,
      
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/18.0', 
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
//const secret_key = "ebc94789d9a9bd3a9f6ce040e0a77aa06a65b15cde2e59527010d563a9830c47";
const secret_key = process.env.SUPRA_SECRET_KEY;

const newClient = new SupraClient("https://rpc-testnet.supra.com", 6);
const senderAddr = new SupraAccount();

// docs - https://docs.supra.com/move/typescript-sdk

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

const contractAddress = "0x5658f4d45001f71897f4a9d46a3cf05a651a2821568032553ca6063a2ea9601e";

//debuging
console.log("senderAddr:", senderAddr);
console.log("contractAddress:", contractAddress);



async function fundAccount(){
    let fund = await newClient.fundAccountWithFaucet(senderAddr.address())

    let balance = await newClient.getAccountSupraCoinBalance(senderAddr.address())

    console.log("FUND", fund);
    console.log("BALANCE", balance);
    console.log("ADDR", senderAddr);


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
            validator,
            supraCoinTransferRawTransactionSerializer1.getBytes()
        );
        console.log("Transaction result:", result);
    } catch (error) {
        console.error("Error in execute:", error);
        throw error;
    }
}

async function fetchPrice() {
    try {
        console.log(senderAddr.address().toUint8Array());
        //let module_name;
        let decimals;
       /* switch(krypto){
          case "BTC":
          //    module_name = "BitcoinOracle";
              decimals = 1;
              number_in_list = 0;
              break;
          case "ETH":
            //  module_name = "EthereumOracle";
              decimals = 2;
              number_in_list = 1;
              break;
          case "SOL":
              //module_name = "SolanaOracle";
              decimals = 3;
              number_in_list = 2;
              break;
        }*/

        let data = await getPriceBybit();
        //let lastPrice = data.result.list[0].lastPrice;
        let priceDataBTC = data.parsed[0].price;
        let priceDataETH = data.parsed[1].price;
        let priceDataSOL = data.parsed[2].price;
        let correct_lastPriceBTC = parseFloat(priceDataBTC.price) * Math.pow(10, priceDataBTC.expo);
        let correct_lastPriceETH = parseFloat(priceDataETH.price) * Math.pow(10, priceDataETH.expo);
        let correct_lastPriceSOL = parseFloat(priceDataSOL.price) * Math.pow(10, priceDataSOL.expo);
        console.log("Last price sol:", correct_lastPriceSOL);


        const scaledPriceBTC = Math.round(correct_lastPriceBTC *  Math.pow(10,1));
        const scaledPriceETH = Math.round(correct_lastPriceETH *  Math.pow(10,2));
        const scaledPriceSOL = Math.round(correct_lastPriceSOL *  Math.pow(10,3));
        console.log(validator);
        let initialTX = await newClient.createRawTxObject(
          validator.address(),
            (await newClient.getAccountInfo(validator.address())).sequence_number,
            contractAddress,
            "Writer",
            "Write",
            [],
            [BCS.bcsSerializeUint64(scaledPriceBTC),BCS.bcsSerializeUint64(scaledPriceETH),BCS.bcsSerializeUint64(scaledPriceSOL)]
        );
        
        console.log("Initial TX:", initialTX);
        TX = initialTX;
        execute();
        return TX;
    } catch (error) {
        console.error("Error in fetchPrice:", error);
        throw error;
    }
}

async function start() {
  try {
   // jiz neni potreba, jelikoz vyuzivam importovanou jiz existuji adresu, takze uz nevytvarim novou
   // tento krok byl nejspis nutny, jelikoz render obraz restartuje servery (nejspis?, potreba vic otestovat?) - a musel bych ihned nastavit novou adresu validatora... (coz je nemozne)
   // proto jsem tedy musel implementovat jiz existujici adresu.
   // await fundAccount();
   setInterval(() => fetchPrice(), 60000);
  } catch (error) {
      console.error("Main execution error:", error);
    }  
  }


  // zdroj https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// dokumentace - https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/Introduction
const app = express();
const port = 3000;
app.use(cors());
app.use(express.static('public'));

// API endpoint pro zakladni funding uctu testnet tokeny
app.get('/fund', async (req, res) => {
  try {
    const data = await fundAccount();
    res.json({ data: data });
   }
  catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.get('/nothing', async (req, res) => {
  try {
    const data = await Nothing();
    res.json({ data: data });
   }
  catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});
// API endpoint pro ulozeni cen vsech kryptomen (btc,eth,sol)
  app.get('/execute', async (req, res) => {
    try {
      const data = await fetchPrice();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }); 
// API endpoint pro spusteni nekonecne cyklu, ktery po intervalech uklada ceny vsech kryptomen (btc,eth,sol)
  app.get('/start', async (req, res) => {
    try {
      const data = await start();
      res.json({ data: data });
     }
    catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }); 

  // Dojde pri spusteni serveru, automaticky se zapne start cyklu
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  //fetchPrice();
  start();
  let nothing = Nothing();
  console.log(nothing);
});
