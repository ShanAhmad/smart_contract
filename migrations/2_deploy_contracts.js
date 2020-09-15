const BuySell = artifacts.require("BuySell");

module.exports = function(deployer) {
    deployer.deploy(BuySell);
};