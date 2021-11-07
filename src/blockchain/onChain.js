import Web3 from 'web3';

import { contractAbi } from './abi.js'
import { contractAddress } from './addr.js'
import { Decimals } from './decimals.js'

const mainnetBSCRPCEndpoints = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/'
];

const web3 = new Web3(mainnetBSCRPCEndpoints[0]);

const Contracts = {
  PancakeRouter: new web3.eth.Contract(contractAbi.PancakeRouter, contractAddress.PancakeRouter),
  PancakeFactory: new web3.eth.Contract(contractAbi.PancakeFactory, contractAddress.PancakeFactory),
  // BabyRouter: new web3.eth.Contract(contractAbi.BabyRouter, contractAddress.BabyRouter),
  // BabyFactory: new web3.eth.Contract(contractAbi.BabyFactory, contractAddress.BabyFactory),
  // ApeRouter: new web3.eth.Contract(contractAbi.ApeRouter, contractAddress.ApeRouter),
  // ApeFactory: new web3.eth.Contract(contractAbi.ApeFactory, contractAddress.ApeFactory),
  // TwindexRouter: new web3.eth.Contract(contractAbi.TwindexRouter, contractAddress.TwindexRouter),
  // TwindexFactory: new web3.eth.Contract(contractAbi.TwindexFactory, contractAddress.TwindexFactory)
}

const ERC20TokenDecimals = async (tokenAddr) => {
  const contract = new web3.eth.Contract(contractAbi.ERC20, tokenAddr);
  return await contract.methods.decimals().call();
};

const ERC20TokenAmountsOut = async (tokenAmount, tokenA, tokenB, tokenADecimals) => {
  const amountIn = 0.01;
  const amountInWei = web3.utils.toWei(amountIn.toString(), 'ether');
  const amountsOut = await Contracts.PancakeRouter.methods.getAmountsOut(
    amountInWei,
    [tokenA, tokenB]
  ).call();
  return tokenAmount*web3.utils.fromWei(amountsOut[1])/amountIn;
};

const ERC20PairReserves = async (tokenA, tokenB) => {
    const pairAddress = await Contracts.PancakeFactory.methods.getPair(tokenA, tokenB).call();
    const pairContract = new web3.eth.Contract(contractAbi.PancakePair, pairAddress);
    return await pairContract.methods.getReserves().call();
};

export {
  web3,
  ERC20TokenDecimals,
  ERC20TokenAmountsOut,
  ERC20PairReserves
};