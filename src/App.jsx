import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/myEpicNft.json';
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  const [currentAccount,setCurrentAccount]= useState("");
  
  const checkIfWalletIsConnected = async() =>{
    const {ethereum} = window;

    if(!ethereum){
      console.log("Please install Metamask!");
      return;
    }else{
      console.log("We have ethereum object",ethereum);
    }

    const accounts = await ethereum.request({method:'eth_accounts'});
    console.log(accounts);

  if(accounts.length !== 0){
    const account = accounts[0];
    console.log("Found an authorized account",account);
    setCurrentAccount(account);
    setupEventListener()
  }else{
    console.log("No Authorized Account Found!");
  }
  }

  const connect = async() =>{
    try{const {ethereum} = window;

    if(!ethereum){
      alert("Install Metamask");
      return;
    }

    const accounts = await ethereum.request({method:'eth_requestAccounts'});

    const account = accounts[0];
    setCurrentAccount(account);
    console.log("Connected Account",account);
       setupEventListener()}
    catch (error) {
      console.log("error");
    }
  }
  

  useEffect(()=>{
    checkIfWalletIsConnected();
  },[]);

  
  
  const renderNotConnectedContainer = () => (
    <button onClick={connect} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const askContractToMintNft= async()=>{
    const contractAddress = "0x956a81B9DE8bA1E68580c1a68474473e48D75260";
    try{
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();
        const connectedContract =  new ethers.Contract(contractAddress,myEpicNft.abi,signer);

        console.log("going to pop up wallet to pay gas fee...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining please wait");

        nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      }else{
        console.log("Ethereum object not found!");
      }
    } catch(error){
      console.log(error);
    }
  }
    const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
      const contractAddress = "0x956a81B9DE8bA1E68580c1a68474473e48D75260"
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (renderNotConnectedContainer()):(<button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>)}
        </div>
      </div>
    </div>
  );
};

export default App;