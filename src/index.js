import { web3, ERC20TokenAmountsOut } from './blockchain/onChain.js'
import { tokenAddress } from './blockchain/addr.js'
import { mongoCreateDocument, mongoUpdateDocument, mongoCheckDocumentExists } from './db/mongo.js'

const blockTimeInterval = 3*1000; // 3 seconds
const OHLCTimeFrame = 60*1*1000; // 1 minute

const simplePriceMonitoring = async (tokenA) => {
  const blockNumber = await web3.eth.getBlockNumber();
  const currentTime = new Date();
  const price = await ERC20TokenAmountsOut(1, tokenA, tokenAddress.BUSD);
  console.log(`[${currentTime.toISOString()}] Block ${blockNumber} - Price in BUSD: ${price}`);

  setTimeout(() => priceMonitoring(tokenA), blockTimeInterval);
};

const computeOHLC = (timeFrameData) => {
  const open = timeFrameData[0].price;
  const high = Math.max(...timeFrameData.map((value) => value.price));
  const low = Math.min(...timeFrameData.map((value) => value.price));
  const close = timeFrameData[timeFrameData.length-1].price;
  const time = timeFrameData[timeFrameData.length-1].currentTime;
  const blockNumber = timeFrameData[timeFrameData.length-1].blockNumber;
  return {
    time: time,
    blockNumber: blockNumber,
    open: open,
    high: high,
    low: low,
    close: close
  };
};

const OHLCMonitoring = async (tokenSymbol, tokenAddr, collectionName, previousTimestamp) => {

  const currentTimestamp = new Date();
  
  // New documents each day
  currentTimestamp.setUTCHours(0,0,0,0);
  const currentISOTimestamp = currentTimestamp.toISOString();

  // New documents each 5 minutes
  // let coeff = 1000*60*5;
  // currentTimestamp = new Date(Math.floor(currentTimestamp.getTime() / coeff) * coeff);

  if (previousTimestamp === undefined || previousTimestamp === null) {
    const exists = await mongoCheckDocumentExists(collectionName, tokenSymbol, currentISOTimestamp);
    if (exists === false) {
      const newDocument = {
        symbol: tokenSymbol,
        timestamp: currentISOTimestamp,
        ohlc: []
      }
      mongoCreateDocument(collectionName, newDocument)
    }
  } else if (previousTimestamp.toISOString() !== currentISOTimestamp) {
    const newDocument = {
      symbol: tokenSymbol,
      timestamp: currentISOTimestamp,
      ohlc: []
    };
    mongoCreateDocument(collectionName, newDocument);
  } else {
    //
  }

  const timeFrameData = [];
  const blockTimer = setInterval(async () => {
    try {
      const blockNumber = await web3.eth.getBlockNumber();
      const currentTime = new Date();
      const price = await ERC20TokenAmountsOut(1, tokenAddr, tokenAddress.BUSD);
      timeFrameData.push({
        currentTime: currentTime,
        blockNumber: blockNumber,
        price: price
      });
    } catch (err) {
      console.error(err);
    }
  }, blockTimeInterval);

  setTimeout(() => {
    clearInterval(blockTimer);
    mongoUpdateDocument(collectionName, tokenSymbol, currentISOTimestamp, computeOHLC(timeFrameData));
    OHLCMonitoring(tokenSymbol, tokenAddr, collectionName, currentTimestamp);
  }, OHLCTimeFrame);

};

OHLCMonitoring('BNX', tokenAddress.BNX, 'BNX/BUSD');
OHLCMonitoring('Gold', tokenAddress.CyberDragonGold, 'CyberDragonGold/BUSD');
OHLCMonitoring('IronKey', tokenAddress.IronKey, 'IronKey/BUSD');
OHLCMonitoring('BNB', tokenAddress.WBNB, 'BNB/BUSD');