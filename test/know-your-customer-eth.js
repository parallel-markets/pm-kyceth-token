const { expect } = require('chai')
const { ethers } = require('hardhat')

const { deploy, fastForward, getHolder, mintPID } = require('./utils')

describe('deposit', () => {
  it('should result in the correct balance if sender is KYCed', async () => {
    const rando = await getHolder()
    const pid = await mintPID(rando.address)
    const kyceth = await deploy('KnowYourCustomerEth', [pid.address])
    const amount = ethers.utils.parseUnits('10', 'ether')
    const tx = await kyceth.connect(rando).deposit({ value: amount })
    await tx.wait()
    await expect(tx).to.emit(kyceth, 'Transfer').withArgs(ethers.constants.AddressZero, rando.address, amount)
  })

  it('should result in an error if sender lacks a PID Token', async () => {
    const rando = await getHolder()
    const pid = await deploy('ParallelID')
    const kyceth = await deploy('KnowYourCustomerEth', [pid.address])
    const amount = ethers.utils.parseUnits('10', 'ether')
    const tx = kyceth.connect(rando).deposit({ value: amount })
    await expect(tx).to.be.revertedWith('Need monitored/unsanctioned PID')
  })

  it('should result in an error if the token is no longer monitored', async () => {
    const rando = await getHolder()
    const pid = await mintPID(rando.address)
    const kyceth = await deploy('KnowYourCustomerEth', [pid.address])
    const amount = ethers.utils.parseUnits('10', 'ether')

    // initial deposit should work
    const tx = await kyceth.connect(rando).deposit({ value: amount })
    await tx.wait()
    await expect(tx).to.emit(kyceth, 'Transfer').withArgs(ethers.constants.AddressZero, rando.address, amount)

    // let's time travel just over a year into the future, when PID token
    // will no longer be monitored
    await fastForward(86400 * 366)

    const uncleanTx = kyceth.connect(rando).deposit({ value: amount })
    await expect(uncleanTx).to.be.revertedWith('Need monitored/unsanctioned PID')
  })

  it('should result in an error if the token has any sanctions', async () => {
    const rando = await getHolder()
    const pid = await mintPID(rando.address)
    const kyceth = await deploy('KnowYourCustomerEth', [pid.address])
    const amount = ethers.utils.parseUnits('10', 'ether')

    // initial deposit should work
    const tx = await kyceth.connect(rando).deposit({ value: amount })
    await tx.wait()
    await expect(tx).to.emit(kyceth, 'Transfer').withArgs(ethers.constants.AddressZero, rando.address, amount)

    // No add sanctions to the holder's token
    const tokenId = await pid.tokenOfOwnerByIndex(rando.address, 0)
    await expect(pid.addSanctions(tokenId, 840)).to.emit(pid, 'SanctionsMatch').withArgs(tokenId, 840)

    const uncleanTx = kyceth.connect(rando).deposit({ value: amount })
    await expect(uncleanTx).to.be.revertedWith('Need monitored/unsanctioned PID')
  })
})

describe('transfer', () => {
  it('should result in an error if receipient lacks a PID Token')

  it('should result in an error if the recipient token is no longer monitored')

  it('should result in an error if the recipient token has any sanctions')
})

describe('transferFrom', () => {
  it('should result in an error if receipient lacks a PID Token')

  it('should result in an error if the recipient token is no longer monitored')

  it('should result in an error if the recipient token has any sanctions')
})
