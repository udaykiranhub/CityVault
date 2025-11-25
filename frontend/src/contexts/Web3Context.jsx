// contexts/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG } from "../Utils/constants"

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        
        // Request accounts
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // For Anvil, we don't need to switch networks as it should be already set
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setContract(contractInstance);
        setIsConnected(true);
console.log("COntract is :",contract)
        // Check user registration
        await checkUserRegistration(contractInstance, accounts[0]);
        
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet. Please make sure MetaMask is connected to Anvil local network.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      // Convert role to number and check if it's not 0 (None)
      const roleNumber = parseInt(role);
      if (roleNumber !== 0) {
        setUserRole(roleNumber.toString());
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      setUserRole(null);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      // User role is 1 (User) in the enum
      const result = await contract.methods.registerUser(1).send({ from: account });
      console.log('Registration result:', result);
      await checkUserRegistration(contract, account);
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
            setIsConnected(true);
            await checkUserRegistration(contractInstance, accounts[0]);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkUserRegistration(contract, accounts[0]);
        } else {
          setAccount(null);
          setUserRole(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{
      web3,
      account,
      contract,
      userRole,
      isConnected,
      loading,
      connectWallet,
      registerUser,
      checkUserRegistration
    }}>
      {children}
    </Web3Context.Provider>
  );
};