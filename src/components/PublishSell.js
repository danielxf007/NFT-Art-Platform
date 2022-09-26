import { useEffect, useState } from "react";
import { giveRights, publishSell } from "../util/interact.js";

const contracts_metadata = require("../contracts/contracts_metadata.json");

const PublishSell = (props) => {
  const [token_name, setTokenName] = useState("");
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
  }, [token_name, price]);

  const onGiveRights = async() => {
      const {success, message} = await giveRights(token_name, contracts_metadata.shop.address);
      alert(message);
  };

  const onPublishPressed = async() => {
      const {success, message} = await publishSell(token_name, price);
      if (success){
          setTokenName("");
          setPrice(0);
      }
      alert(message);
  };

  return (
    <div className="PublishSell">
      <h1>Publish Sell</h1>
      <form>
        <h2>Token Name</h2>
        <br></br>
          <input
          type="text"
          value={token_name}
          required
          onChange={(event) => setTokenName(event.target.value)}
          />
        <h2>Set Up Prize </h2>
        <br></br>
          <input
          type="number"
          step={0.0001}
          min={0.0}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          />
      </form>
      <br></br>
      <br></br>
      <button onClick={onGiveRights}>Give Rights</button>
      <button onClick={onPublishPressed}>Publish</button>
    </div>
  );
};

export default PublishSell;
