import Head from "next/head";
import { BigNumber, Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";
import classes from '../styles/Home.module.css';
import Web3Modal from 'web3modal';

export default function Home() {
  const zero = BigNumber.from(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const [tokensMinted, setTokensMinted] = useState(zero)
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero)
  const [loading, setLoading] = useState(false)
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;

    } catch (error) {
      console.log({error})
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log({error})
    }
  }

  const getTokensToBeClaimed = async () => {
    try {
      const provider = getProviderOrSigner()
      const nftContract = newContract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )
       
      const signer = getProviderOrSigner(true)
      const address = signer.getAddress()
      const balance = await nftContract.balanceOf(address)
      
      if (balance === 0) {
        setTokensToBeClaimed(zero)
      } else {
        let amount = 0
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenofOwnerByIndex(address, i)
          const claimed = await tokenContract.tokensIdsClaimed(tokenId)
          if (!claimed) {
            amount++
          }
        }
        setTokensToBeClaimed(amount)
      }

    } catch (error) {
      console.log({error})
    }
  }

  const getBalanceOfCtyptoDevTokens = async () => {
    try {
      const provider = getProviderOrSigner()
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const signer = getProviderOrSigner(true)
      const address = signer.getAddress()
      const balance = await tokenContract.balanceOf(address)
      setBalanceOfCryptoDevTokens(balance)
    } catch (error) {
      console.log({error})
    }
  }

  const getTotalTokensMinted = async () => {
    try {
      const provider = getProviderOrSigner()
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const _tokensMinted = await tokenContract.totalSupply()
      setTokensMinted(_tokensMinted)
    } catch (error) {
      console.log({error})
    }
  }

  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )

      const value = 0.001 * amount;
      const transaction = await tokenContract.mint(amount, {value: utils.parseEther(value.toString())});

      setLoading(true)
      await transaction.wait()
      setLoading(false)
      window.alert("Succesfully minted Crypto Dev Token")
      
      await getBalanceOfCtyptoDevTokens()
      await getTotalTokensMinted()  
      await getTokensToBeClaimed()  

    } catch (error) {
      console.log({error})
    }
  }

  const claimCryptoDevTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )
 
      const transaction = await tokenContract.claim()
      setLoading(true)
      await transaction.wait()
      setLoading(false)
      window.alert("Successfully claimed Crypto Dev Tokens")
      await getBalanceOfCtyptoDevTokens()
      await getTotalTokensMinted()  
      await getTokensToBeClaimed()  

    } catch (error) {
      console.log({error})
    }
  }

  const renderButton = () => {
    if (loading) {
      <button className={classes.button}>Loading...</button>
    }

    if (tokensToBeClaimed) {
      return (
        <>
          <div className={classes.description}>
            {tokensToBeClaimed * 10} Tokens to be claimed!
          </div>
          <button onClick={claimCryptoDevTokens} className={classes.button}>Claim Tokens</button>
        </>
      )
    }

    return (
      <div style={{display: 'flex-col'}}>
        <div>
          <input type="number" placeholder="Amount of Tokens" onChange={(event) => setTokenAmount(BigNumber.from(event.target.value))}/>
        </div>
        <button className={classes.button} disabled={tokenAmount === 0} onClick={() => mintCryptoDevToken(tokenAmount)}>Mint Tokens</button>
      </div>
    )
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
      getBalanceOfCtyptoDevTokens()
      getTotalTokensMinted()  
      getTokensToBeClaimed()  
    }
  }, [walletConnected])

  return (
    <>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={classes.main}>
        <div>
          <h1 className={classes.title}>Welcome to CryptoDevs ICO</h1>
          <div className={classes.description}>You can claim or mint Crypto Dev tokens here</div>
        </div>
        {
          walletConnected
           ? <div>
                <div className={classes.description}>You have minted {utils.formatEther(balanceOfCryptoDevTokens)} CryptoDev Tokens</div>
                <div className={classes.description}>Overall {utils.formatEther(tokensMinted)} / 1000 have been minted</div>
              </div>
           : <button onClick={connectWallet} className={classes.button}>Connect your wallet</button>
        }
        {renderButton()}
        <div>
          <img src="./0.svg" className={classes.image} alt="cryptodevs" />
        </div>
      </div>
      <footer className={classes.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </>
  )
}
