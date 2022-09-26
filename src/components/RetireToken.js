import { useEffect, useState } from "react";
import { retireToken } from "../util/interact.js";

const RetireToken = (props) => {
  const [token_name, setTokenName] = useState("");
  
  useEffect(() => {
  
  }, [token_name]);
  
  const hasDebt = async (name) => {
    const response = await fetch("http://localhost:3000/getAssets");
    const assets = await response.json();
    const asset = assets.filter(asset => asset.Key == name)[0];
    const maintenance_cost = asset.Record.Maintenance_cost;
    let debt;
    if(Object.keys(maintenance_cost).length === 0){
        return false;
    }else{
        for(let key in maintenance_cost) {
            if (maintenance_cost.hasOwnProperty(key)) {
                  debt = maintenance_cost[key];
                  if(debt > 0){
                    return true;
                  }
            }
        }
    }
    return false;
  };

  const onRetire = async () => {
    const has_debt = await hasDebt(token_name);
    const {success, message} = await retireToken(token_name, has_debt);
    if(success) {
      setTokenName("");
    }
    alert(message); 
  };
  
  return (
    <div className="RetireToken">
      <form>
        <h2>Token Name</h2>
        <input
          type="text"
          onChange={(event) => setTokenName(event.target.value)}
        />
      </form>
      <br></br>
      <br></br>
      <button onClick={onRetire}>Retire</button>
    </div>
  );
}
export default RetireToken;
