const { ethers, upgrades } = require('hardhat')

const deploy = async (contractName, params = []) => {
  const factory = await ethers.getContractFactory(contractName)
  const contract = await upgrades.deployProxy(factory, params)
  await contract.deployed()
  return contract
}

const fastForward = async (seconds) => {
  await ethers.provider.send('evm_increaseTime', [seconds])
  await ethers.provider.send('evm_mine')
}

const mintPID = async (addy, uri = 'cid://adsf', traits = ['kyc'], subjectType = 1) => {
  const pid = await deploy('ParallelID')
  const mintTx = await pid.mint(addy, uri, traits, subjectType)
  await mintTx.wait()
  return pid
}

const getHolder = async () => {
  const signers = await ethers.getSigners()
  return signers[1]
}

module.exports = { deploy, fastForward, getHolder, mintPID }
