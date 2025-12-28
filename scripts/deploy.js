const { ethers } = require("hardhat");

async function main() {
  const InfrastructureReports = await ethers.getContractFactory("InfrastructureReports");
  const contract = await InfrastructureReports.deploy();
  await contract.waitForDeployment();

  console.log("InfrastructureReports deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});