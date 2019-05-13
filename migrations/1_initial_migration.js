const Migrations = artifacts.require('Migrations');
const Splitter = artifacts.require('Splitter');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Migrations);
  deployer.deploy(Splitter, accounts.slice(1)); // The first account is assumed
                                                // to be Alice.
};
