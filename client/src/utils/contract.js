import { ethers }from "ethers";
import abi from "../abi/CertificateContract.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // địa chỉ contract của bạn

// Ensure MetaMask is on the local Hardhat chain (chainId 31337) before returning the contract.
export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed!");

  const desiredChainId = "0x7A69"; // 31337 in hex

  try {
    // Request MetaMask to switch to the desired chain
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: desiredChainId }],
    });
  } catch (switchError) {
    // 4902: the chain is not added to MetaMask
    // Some providers may return different codes/messages, so try add if switch failed
    try {
      if (
        switchError.code === 4902 ||
        switchError.code === -32603 ||
        (switchError.message && switchError.message.toLowerCase().includes("unrecognized chain"))
      ) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: desiredChainId,
              chainName: "Hardhat Localhost",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["http://127.0.0.1:8545"],
              blockExplorerUrls: [],
            },
          ],
        });
        // After adding, try switching again
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChainId }],
        });
      } else if (switchError.code === 4001) {
        // User rejected the request
        throw new Error("User rejected network switch");
      } else {
        console.warn("Failed to switch network:", switchError);
      }
    } catch (addError) {
      // If adding also failed, surface a meaningful error
      console.error("Error adding/switching network:", addError);
      throw addError;
    }
  }

  // Create provider and contract instance
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
  return contract;
}
