import { useEffect, useState } from "react";
import { mintNFT } from "../util/interact.js";

const Minter = (props) => {
  const [image_url, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  
  useEffect(() => {
  }, []);
  
  const assetExist = (assets, name) => {
    let asset_data;
    let exist = false;
    for(let index=0; index < assets.length; index++){
        asset_data = assets[index]
        if(asset_data.Key === name){
            exist = true;
            break;
        }
    }
    return exist;
  };

  const onMintPressed = async () => {
    const response = await fetch("http://localhost:3000/getAssets");
    const assets = await response.json();
    const exist = assetExist(assets, name);
    const {success, message} = await mintNFT(exist, file, name);
    if(success){
      setName("");
      setImageURL("");
    }
    alert(message);
  };

  return (
  <div className="Minter">
    <h1>Mint NFT</h1>
    <form>
      <h2>Upload Image</h2>
      <img src={image_url} width="256" height="256"/>
      <br></br>
      <input
        type="file"
        multiple accept="image/*"
        onChange={(event) => {
        setFile(event.target.files[0])
        setImageURL(URL.createObjectURL(event.target.files[0]))}}
      />
      <br></br>
      <h2>Name</h2>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
    </form>
    <br></br>
    <br></br>
    <button onClick={onMintPressed}>Mint</button>
  </div>
  );
};

export default Minter;
