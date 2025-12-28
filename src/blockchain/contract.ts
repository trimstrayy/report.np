import { ethers } from "ethers";

export const INFRASTRUCTURE_REPORTS_ABI = [
  "event ReportCreated(uint256 indexed reportId, address indexed reporter, string ipfsHash)",
  "event ReportUpvoted(uint256 indexed reportId, address indexed upvoter)",
  "event RepairStarted(uint256 indexed reportId)",
  "event RepairCompleted(uint256 indexed reportId, string proof)",
  "function createReport(string _ipfsHash, int256 _lat, int256 _lon) external",
  "function upvoteReport(uint256 _reportId) external",
  "function getReport(uint256 _reportId) external view returns (tuple(address reporter, string ipfsHash, int256 latitude, int256 longitude, uint256 timestamp, uint256 upvotes, uint256 severity, uint8 status, address[] upvoters, string repairProof))",
  "function getCredits(address _user) external view returns (uint256)",
  "function reportCount() external view returns (uint256)"
];

export const CONTRACT_ADDRESS = "REPLACE_WITH_DEPLOYED_CONTRACT_ADDRESS";

let provider: ethers.BrowserProvider;
let signer: ethers.Signer;
let contract: ethers.Contract;

export const initBlockchain = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    INFRASTRUCTURE_REPORTS_ABI,
    signer
  );

  return contract;
};

export const createReportOnChain = async (
  ipfsHash: string,
  lat: number,
  lon: number
) => {
  if (!contract) await initBlockchain();

  const scaledLat = BigInt(Math.round(lat * 1e6));
  const scaledLon = BigInt(Math.round(lon * 1e6));

  const tx = await contract.createReport(
    ipfsHash,
    scaledLat,
    scaledLon
  );

  return await tx.wait();
};

export const upvoteReportOnChain = async (reportId: number) => {
  if (!contract) await initBlockchain();
  const tx = await contract.upvoteReport(reportId);
  return await tx.wait();
};

export const getReportFromChain = async (reportId: number) => {
  if (!contract) await initBlockchain();

  const report = await contract.getReport(reportId);

  return {
    reporter: report[0],
    ipfsHash: report[1],
    latitude: Number(report[2]) / 1e6,
    longitude: Number(report[3]) / 1e6,
    timestamp: Number(report[4]),
    upvotes: Number(report[5]),
    severity: Number(report[6]),
    status: Number(report[7]),
    upvoters: report[8],
    repairProof: report[9]
  };
};

export const getUserCredits = async (address: string) => {
  if (!contract) await initBlockchain();
  return Number(await contract.getCredits(address));
};

export const getSignerAddress = async () => {
  if (!signer) await initBlockchain();
  return await signer.getAddress();
};