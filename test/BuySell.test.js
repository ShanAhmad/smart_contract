const BuySell = artifacts.require('./BuySell.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()


contract('BuySell', ([deployer, seller, buyer]) => {
    let buysell
    before(async() => {
        buysell = await BuySell.deployed()
    })

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = await buysell.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('products', async() => {
        let result, productCount
        before(async() => {
            result = await buysell.createProduct('Honda City', web3.utils.toWei('1', 'Ether'), { from: seller })
            productCount = await buysell.productCount()
        })
        it('creates products', async() => {
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'Honda City', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, seller, 'owner is correct')
            assert.equal(event.purchased, false, 'purchased is correct')

            await await buysell.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
            await await buysell.createProduct('Honda City', 0, { from: seller }).should.be.rejected;
        })

        it('lists products', async() => {
            const product = await buysell.products(productCount)
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'Honda City', 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'owner is correct')
            assert.equal(product.purchased, false, 'purchased is correct')

        })

        it('sells products', async() => {
            let oldsellerbalance
            oldsellerbalance = await web3.eth.getBalance(seller)
            oldsellerbalance = new web3.utils.BN(oldsellerbalance)



            result = await buysell.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') })
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'Honda City', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'owner is correct')
            assert.equal(event.purchased, true, 'purchased is correct')


            let newsellerbalance
            newsellerbalance = await web3.eth.getBalance(seller)
            newsellerbalance = new web3.utils.BN(newsellerbalance)

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)

            const expectedbalance = oldsellerbalance.add(price)
            assert.equal(newsellerbalance.toString(), expectedbalance.toString())

            await buysell.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
            await buysell.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
            await buysell.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
            await buysell.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })

    })
})