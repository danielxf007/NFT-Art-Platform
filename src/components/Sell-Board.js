import { useEffect, useState } from "react";
import './Board.css';

import {
    buyNFT,
    getPublishedSells
} from "../util/interact";

import ReactPaginate from 'react-paginate';

var bigInt = require("big-integer");
const wei = bigInt(1000000000000000000);

const BoardCell = (props) => {

    const onCheckDebt = async () => {
        const response = await fetch("http://localhost:3000/getAssets");
        const assets = await response.json();
        const asset = assets.filter(asset => asset.Key == props.name)[0];
        const maintenance_cost = asset.Record.Maintenance_cost;
        let message = "";
        let debt;
        if(Object.keys(maintenance_cost).length === 0){
            message = `${props.name} has no debt`;
        }else{
            for(let key in maintenance_cost) {
                if (maintenance_cost.hasOwnProperty(key)) {
                      debt = maintenance_cost[key];
                      message += `${props.name} owes ${debt} eth to ${key}\n`;
                }
            }
        }
        alert(message);
    };

    const onBuyPressed = async() => {
      const {success, message} = await buyNFT(props.name, props.price);
      alert(message);
    };

    return (
        <div className="nft-item">
          <div className="nft-name">
            {props.name}
          </div>
          <img className="nft-image" src={props.image_url}/>
          <div className="nft_price">
            {props.price + ' ETH'}
          </div>
          <br></br>
          <button onClick={onBuyPressed}>Buy</button>
          <br></br>
          <button onClick={onCheckDebt}>Check Debt</button>
        </div>
    );
}

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function Items({currentItems}) {
  const name = 0;
  const image_url = 1;
  const price = 2;

  return (
    <>
      {
        currentItems && currentItems.map((item, index) =>{
          return <BoardCell
                  key={String(index)}
                  name = {item[name]}
                  image_url = {item[image_url]}
                  price = {(bigInt(item[price])/wei).toString()}
                  />
        })
      }
    </>
  );
}

function PaginatedItems({ itemsPerPage }) {

  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const fetchSellData = async() => {
      const items = await getPublishedSells();
      setCurrentItems(items.slice(itemOffset+1, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));
    }
    fetchSellData();
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <>
    <div className="nft-item-container">
    <Items currentItems={currentItems}/>
    </div>
      <ReactPaginate
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel="< previous"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
      />
    </>
  );
}

const MarketPlace = (props) => {
    return (
        <div>
          <h1>Sale Board</h1>
              <PaginatedItems itemsPerPage={10}/>
        </div>
    );
}

export default MarketPlace;
