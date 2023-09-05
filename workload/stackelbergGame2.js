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
        let numberOfSeller = 20;
        let numberOfBuyer = 20;
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
        let updatedUsers = await this.simulateStackelberg(userInfoArr);
        console.log("Updated Users After Stackelberg: ", updatedUsers);
         let asws = this.calculateASWS(updatedUsers);
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

        //stackelberg

        async simulateStackelberg(users) {
	console.log("Received users: ", users);
    // Check if users array is valid
    if (!Array.isArray(users) || users.length === 0) {
        console.error("Invalid users array");
        return [];
    }
	  // Find the leader among sellers (you can use other criteria)
    let leader = users.find(user => user.type === 'seller');
    if (!leader) {
        console.error("No leader found");
        return users;
    }
    // Identify followers
    let followers = users.filter(user => user.id !== leader.id);

    // Leader decides strategy first
    leader.price = (parseFloat(leader.price) * 0.95).toFixed(2); // Lowering the price by 5%

    // Followers react to leader's strategy
    for (let follower of followers) {
        if (follower.type === 'buyer') {
            follower.price = (parseFloat(follower.price) * 1.05).toFixed(2); // Raising the price by 5%
        } else { // seller
            follower.price = (parseFloat(follower.price) * 0.98).toFixed(2); // Lowering the price by 2%
        }
    }

    // Combine the leader and followers back into the user list
    let updatedUsers = [leader, ...followers];

    // Log statistics or perform additional calculations if needed
    console.log("Leader ID: ", leader.id);
    console.log("Leader New Price: ", leader.price);

    return updatedUsers;
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

