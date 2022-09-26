import './App.css';
import {useEffect, useState } from "react";
import Minter from './components/Minter'
import MaintenancePayment from './components/MaintenancePayment'
import RetireToken from './components/RetireToken'
import PublishSell from './components/PublishSell'
import MarketPlace from './components/Sell-Board'
import { connectWallet } from './util/interact';
import {clearPinata} from './util/pinata';

function App(props) {
  const [component, setComponent] = useState("main_menu");
  const [walletAddress, setWallet] = useState("");

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet("");
          alert("Connect to Metamask");
        }
      });
    } else {
      alert("You must install Metamask, a virtual Ethereum wallet, in your browser")
    }
  }

  const connectWalletPressed = async () => {
    const wallet = await connectWallet();
    setWallet(wallet);
  };

  const clearPinataDB = async() => {
    const result = await clearPinata();
  };

  const components = {
    "minter": <Minter/>, "maintenance": <MaintenancePayment/>, "retire_token": <RetireToken/>, "publish_sell": <PublishSell/>,
    "sale_board": <MarketPlace/>
  }

  useEffect(() => {
    addWalletListener();
  }, []);

  if(component === "main_menu"){
    return (
      <div>
        <h1>NFT Art</h1>
        <button onClick={connectWalletPressed}>
          {walletAddress.length > 0 ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
        <button onClick={clearPinataDB}>Clear Pinata</button>
        <button onClick={() => setComponent("minter")}>
          Mint
        </button>
        <button onClick={() => setComponent("maintenance")}>
          Maintenance
        </button>
        <button onClick={() => setComponent("retire_token")}>
          Retire Token
        </button>
        <button onClick={() => setComponent("publish_sell")}>
          Publish Sale
        </button>
        <button onClick={() => setComponent("sale_board")}>
          Sale Board
        </button>
      </div>
    );  
  }else{
    return (
      <div>
        {components[component]}
        <br></br>
        <button onClick={() => setComponent("main_menu")}>Back</button>
      </div>
    );
  }
};

export default App;
