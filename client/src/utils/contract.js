import { ethers } from "ethers";
import abi from "../abi/CertificateContract.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed!");

  const desiredChainId = "0x7A69"; // Hardhat chain ID (31337)

  // --- Switch network ---
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: desiredChainId }],
    });
  } catch (switchError) {
    try {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: desiredChainId,
              chainName: "Hardhat Localhost",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      }
    } catch (addError) {
      console.error("Network switch/add error:", addError);
      throw addError;
    }
  }

  // --- ethers v5: Web3Provider ---
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // --- ethers v5: ABI nằm trực tiếp trong JSON ---
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

  return contract;
}

/**
 * issue new certificate on blockchain
 * @param {*} id 
 * @param {*} dataHash 
 * @param {*} issuedTo 
 * @param {*} expireAt 
 * @returns 
 */
export async function issueNewCertificate(id, dataHash, issuedTo, expireAt) {
  const contract = await getContract();

  const Bid = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(id)); // bytes32
  const BdataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dataHash)); // bytes32
  const BexpireAt = expireAt
    ? Math.floor(new Date(expireAt).getTime() / 1000)
    : 0;

  const tx = await contract.create(Bid, BdataHash, issuedTo, BexpireAt);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * add candidate to organization
 * @param {*} candidate (public key)
 */
export async function addCandToOrg(candidate) {
  const contract = await getContract();
  const tx = await contract.addUser(candidate);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * verify certificate using cert id and CID(hash)
 * @param {*} id 
 * @param {*} cid 
 */
export async function verifyCertificate(id, cid) {
  const contract = await getContract();

  const Bid = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(id)); // bytes32
  const BdataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(cid)); // bytes32

  const result = await contract.verify(Bid, BdataHash);
  return result;
}

/**
 * revoke certificate by cert id
 * @param {*} id 
 * @returns 
 */
export async function revokeCertificate(id) {
  const contract = await getContract();
  const Bid = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(id)); // bytes32

  const tx = await contract.revoke(Bid);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * set issuer in smart contract using public key (ONLY OWNER CAN SET ISSUER)
 * @param {*} issuerAddress 
 * @param {*} status 
 * @returns 
 */
export async function setIssuer(issuerAddress, status) {
  const contract = await getContract();
  const tx = await contract.setIssuer(issuerAddress, status);
  const receipt = await tx.wait();
  return receipt;
}

export async function isIssuer(address) {
  const contract = await getContract();
  const result = await contract.isOrgIssuer(address);
  return result;
}

export async function isOwner(address) {
  const contract = await getContract();
  const result = await contract.isAdmin(address);
  return result;
}