require("dotenv").config();

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./fabric-samples/test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./fabric-samples/test-application/javascript/AppUtil.js');
const bodyParser = require('body-parser')

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'nft_art_platform';

const express = require('express');
const app = express();
const publicPath = path.join(__dirname, 'build');
const port = process.env.PORT || 3000;

var gateway;

app.use(express.static(publicPath));
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function organizeCredentials() {
    try {
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccp = buildCCPOrg1();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

	// setup the wallet to hold the credentials of the application user
	const wallet = await buildWallet(Wallets, walletPath);

	// in a real application this would be done on an administrative flow, and only once
	await enrollAdmin(caClient, wallet, mspOrg1);

	// in a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
	gateway = new Gateway();
	await gateway.connect(ccp, {
		wallet,
		identity: org1UserId,
		discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
	});
    } catch (error) {
		    console.error(`******** FAILED to run the application: ${error}`);}
}

async function getAssets(){
	try {
        // Build a network instance based on the channel where the smart contract is deployed
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
        // This type of transaction would only be run once by an application the first time it was started after it
        // deployed the first time. Any updates to the chaincode deployed later would likely not need to run
        // an "init" type function.
        const assets = await contract.evaluateTransaction('GetAllAssets');
        return assets;
    }  catch (error) {
		    console.error(`******** FAILED to run the application: ${error}`);}
}

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/getAssets', async (req, res) => {
    const assets = await getAssets();
    res.json(JSON.parse(assets));
});

const server = app.listen(port, async() => {
   await organizeCredentials();
   console.log('Server is up!', port);
});
