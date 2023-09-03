const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require('fs');

class InitLedgerWorkload extends WorkloadModuleBase {
    constructor() {

        super();
	  this.usersJson = require('./users.json');
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        this.sutAdapter = sutAdapter;

    }


    async submitTransaction() {
        let numberOfSeller = 10;
        let numberOfBuyer = 10;
        let userInfoArr = [];
        let endKey = `user${this.padLeadingZeros(numberOfSeller + numberOfBuyer + 1, 4)}`;

        for (let i = 0; i < numberOfBuyer; i++) {
            let individualUser = await this.generateBuyer(i);
            userInfoArr.push(individualUser);
        }

        let j = numberOfBuyer;
        while (j < numberOfSeller + numberOfBuyer) {
            let individualUser = await this.generateSeller(j);
            userInfoArr.push(individualUser);
            j += 1;
        }
	    // Calcul de l'ASWS
    let asws = this.calculateASWS(userInfoArr);
    console.log("ASWS : ", asws);

	let args = {
        contractId: 'smartcontract',
        contractFunction: 'InitLedger',
        invokerIdentity: 'User1', // the invoker's identity
        contractArguments: [JSON.stringify(this.usersJson), endKey], // Include the JSON object
        readOnly: false // If it's a readOnly transaction or not
    };

    await this.sutAdapter.sendRequests(args);
    }
        calculateASWS(users) {
    let totalQuantity = 0;
    let totalPrice = 0;

    for (let user of users) {
        let quantityAsFloat = parseFloat(user.quantity);
        let priceAsFloat = parseFloat(user.price);

        totalQuantity += quantityAsFloat;
        totalPrice += priceAsFloat;
    }

    let aswsPrice = totalPrice / users.length;
    let aswsQuantity = totalQuantity / users.length;

    console.log("ASWS Prix Moyen : ", aswsPrice);
    console.log("ASWS Quantité Moyenne : ", aswsQuantity);

    return {
        aswsPrice: aswsPrice,
        aswsQuantity: aswsQuantity    };}



    async generateBuyer(idNumber) {
        let minQuantity = 2.1, maxQuantity = 6;
        let minPriceB = 14, maxPriceB = 22;
        let rdQuantity = (Math.random() * (maxQuantity - minQuantity) + minQuantity).toFixed(3);
        let rdPrice = (Math.random() * (maxPriceB - minPriceB) + minPriceB).toFixed(1);
        idNumber = this.padLeadingZeros(idNumber, 4);

        let content = this.createContent(rdQuantity, rdPrice, 'buyer', idNumber);
        await this.writeToFile(content, idNumber);

        let individualUser = this.createUserInfo(rdQuantity, rdPrice, `user${idNumber}`);
        return individualUser;
    }

    async generateSeller(idNumber) {
        let minQuantity = 2.1, maxQuantity = 6;
        let minPriceS = 5, maxPriceS = 13;
        let rdQuantity = (Math.random() * (maxQuantity - minQuantity) + minQuantity).toFixed(3);
        let rdPrice = (Math.random() * (maxPriceS - minPriceS) + minPriceS).toFixed(1);
        idNumber = this.padLeadingZeros(idNumber, 4);

        let content = this.createContent(rdQuantity, rdPrice, 'seller', idNumber);
        await this.writeToFile(content, idNumber);

        let individualUser = this.createUserInfo(rdQuantity, rdPrice, `user${idNumber}`);
        return individualUser;
    }

    createContent(quantity, price, type, idNumber) {
        // Implement the logic for creating content based on type (buyer/seller
        // Similar to what you have in the given snippet
	return `Quantity: ${quantity}, Price: ${price}, Type: ${type}, ID: ${idNumber}`;
    }

    writeToFile(content, idNumber) {
        return new Promise((resolve, reject) => {
            fs.writeFile(`//home//moonzad//go//src//github.com//zaddgit//caliper-benchmarks//data//user${idNumber}.py`, content, function(err) {
                if (err) reject(err);
                resolve();
            });
        });
    }

    createUserInfo(quantity, price, id) {
        // Implement the logic for creating user info
        // Similar to what you have in the given snippet
	return {
        quantity: quantity,
        price: price,
        id: id
    };
    }


    padLeadingZeros(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    async cleanupWorkloadModule() {
        return Promise.resolve();
    }
}

function createWorkloadModule() {
    return new InitLedgerWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

