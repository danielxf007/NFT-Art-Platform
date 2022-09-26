import { pinFileToIPFS, getPinList, removePinFromIPFS} from "./pinata";
import {
  tokenExists, canTradeToken,
  sellPublished, tokenSold, auctionPublished,
  auctionFinished, isAuctionSeller, isHighestBidder,
  isBidEnough, hasBidded, hasWinner} from "./validations";
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contracts_metadata = require("../contracts/contracts_metadata.json");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const bigInt = require("big-integer");
const wei = bigInt(10**18);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return addressArray[0];
    } catch (_err) {
      return "";
    }
  }
};

export const mintNFT = async (on_sidechain, image, token_name) => {
  if(!on_sidechain){
    return {
      success: false,
      message: "There needs to be an asset on the sidechain"
    };
  }
  if(token_name === "") {
    return {
      success: false,
      message: "You need to gave a name to your NFT."
    };
  }
  const token_exists = await tokenExists(token_name);
  if(token_exists){
    return {
      success: false,
      message: "This token already exists"
    };
  }   
  const file_res = await pinFileToIPFS(image, token_name);
  if(!file_res.success){
    return {
      success: false,
      message: "Something went wrong while uploading your file."
    };
  }
  const contract_metadata = contracts_metadata.nft_storage;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .mintNFT(on_sidechain, token_name, file_res.pinata_url, window.ethereum.selectedAddress)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters]
    });
    return {
      success: true,
      message: "Wait until the transaction is approved"
    };
  } catch (error) {
    const _res = await removePinFromIPFS(file_res.data_hash);
    return {
      success: false,
      message: "Something went wrong: " + error.message,
    };
  }
};

export const payMaintenance = async(beneficiary, amount) => {
  const contract_metadata = contracts_metadata.nft_storage;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    value: bigInt(parseFloat(amount)*wei).toString(16),
    data: window.contract.methods
      .payMaintenance(beneficiary)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      message: "Wait until the transaction is approved"
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong " + error.message
    };
  }  
};

export const retireToken = async(token_name, has_debt) => {
  const token_exists = await tokenExists(token_name);
  if(!token_exists){
    return {
      success: false,
      message: "This token does not exists"
    };
  }
  if(has_debt){
    return {
        sucess:false,
        message: "You owe maintenance cost" 
    };
  }
  const contract_metadata = contracts_metadata.nft_storage;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .retireToken(token_name, has_debt)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      message: "Wait until the transaction is approved"
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong " + error.message
    };
  }  
};

export const giveRights = async(token_name, beneficiary) => {
  const token_exists = await tokenExists(token_name);
  if(!token_exists){
    return {
      success: false,
      message: "This token does not exist",
    };    
  }
  const can_trade = await canTradeToken(token_name, window.ethereum.selectedAddress);
  if(!can_trade){
    return{
      success: false,
      message: "You cannot trade this token"
    };
  }
  const contract_metadata = contracts_metadata.nft_storage;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .giveRights(token_name, beneficiary)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      message: "Wait until the transaction is approved"
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong: " + error.message,
    };
  }
};

export const publishSell = async(token_name, token_price) => {
  if(parseFloat(token_price) === 0.0) {
    return {
      success: false,
      message: "The price cannot be zero.",
    };
  }
  const token_exists = await tokenExists(token_name);
  if(!token_exists){
    return {
      success: false,
      message: "This token does not exist",
    };    
  }
  const can_trade = await canTradeToken(token_name, window.ethereum.selectedAddress);
  if(!can_trade){
    return{
      success: false,
      message: "You cannot trade this token"
    };
  }
  const published = await sellPublished(token_name);
  if(published){
    return{
      success: false,
      message: "This token is already been sold"
    }
  }
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address,
    from: window.ethereum.selectedAddress,
    data: window.contract.methods
      .publishSell(token_name, bigInt(parseFloat(token_price)*wei).toString())
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return{
      success: true,
      message: "Wait until the transaction is approved"
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong: " + error.message
    };
  }
};

export const getPublishedSells = async() => {
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  try{
    return contract.methods.getPublishedSells().call();
  }catch(_err){
    return [];
  }    
};

export const buyNFT = async(token_name, token_price) => {
  const sold = await tokenSold(token_name);
  if(sold){
    return{
      success: false,
      message: "This token was already sold"
    };
  }
  const contract_metadata = contracts_metadata.shop;
  window.contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
  const transactionParameters = {
    to: contract_metadata.address, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: bigInt(parseFloat(token_price)*wei).toString(16),
    data: window.contract.methods
      .buy(token_name)
      .encodeABI(),
  };
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      message: "Wait until the transaction is approved"
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong " + error.message
    };
  }
};
