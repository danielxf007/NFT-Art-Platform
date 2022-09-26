import { useEffect, useState } from "react";
import { payMaintenance } from "../util/interact.js";

const MaintenancePayment = (props) => {
  const [name, setName] = useState("");
  const [walletAddress, setWallet] = useState("");
  const [amount, setAmount] = useState(0.0);
  
  useEffect(() => {
  
  }, [name, walletAddress, amount]);

  
  const onCheckDebt = async () => {
    const response = await fetch("http://localhost:3000/getAssets");
    const assets = await response.json();
    const asset = assets.filter(asset => asset.Key == name)[0];
    const maintenance_cost = asset.Record.Maintenance_cost;
    let message = "";
    let debt;
    if(Object.keys(maintenance_cost).length === 0){
        message = `The ${name} has no debts`;
    }else{
        for(let key in maintenance_cost) {
            if (maintenance_cost.hasOwnProperty(key)) {
                  debt = maintenance_cost[key];
                  message += `You owe ${debt} eth to ${key}\n`;
            }
        }
    }
    alert(message);
  };
  
  const onPayPressed = async () => {
    const {success, message} = await payMaintenance(walletAddress, amount);
    if(success) {
      setName("");
      setWallet("");
      setAmount(0.0);
    }
    alert(message);
  };
  
  return (
    <div className="MaintenancePayment">
      <form>
        <h2>NFT Name</h2>
        <input
          type="text"
          onChange={(event) => setName(event.target.value)}
        />
        <br></br>
        <br></br>
        <h2>Wallet</h2>
        <input
          type="text"
          onChange={(event) => setWallet(event.target.value)}
        />
        <br></br>
        <br></br>
        <h2>Amount</h2>
        <input
        type="number"
        placeholder="0"
        onChange={(event) => setAmount(event.target.value)}
        />
      </form>
      <br></br>
      <br></br>
      <button onClick={onPayPressed}>Pay</button>
      <button onClick={onCheckDebt}>Check Debt</button>
    </div>
  );
};

export default MaintenancePayment;
