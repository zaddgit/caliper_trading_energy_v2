const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require('fs');

class InitLedgerWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.usersJson = require('./users_game.json');
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
	// récupère les arguments
        const Quantity = this.roundArguments['Quantity'];
        const Price = this.roundArguments['Price'];
        const Type = this.roundArguments['Type'];
        const ID = this.roundArguments['ID'];


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

        // Identify the leader seller with the lowest price
        let leaderSeller = this.usersJson.find(user => user.type === 'seller');
        for (let seller of this.usersJson) {
            if (seller.type === 'seller' && parseFloat(seller.price) < parseFloat(leaderSeller.price)) {
                leaderSeller = seller;
            }
        }

        // Calculate the ASWS
        let asws = this.calculateASWS(this.usersJson.filter(user => user.type === 'buyer'));

        // Apply Leader-Follower strategy
        for (let user of this.usersJson) {
            if (user.type === 'seller' && user === leaderSeller) {
                user.price = leaderSeller.price;
            } else if (user.type === 'seller') {
                user.price = asws.aswsPrice;
            } else if (user.type === 'buyer') {
                user.price = asws.aswsPrice;
            }
        }

        console.log("ASWS : ", asws);

        let args = {
            contractId: 'smartcontract',
            contractFunction: 'InitLedger',
            invokerIdentity: 'User1',
            contractArguments: [JSON.stringify(this.usersJson), endKey],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(args);
    }

    calculateASWS(users) {
        let totalQuantity = 0;
        let totalPrice = 0;

        for (let user of users) {
            let quantityAsFloat = parseFloat(user.quantity);
            let priceAsFloat = parseFloat(user.price);

            if (!isNaN(quantityAsFloat) && !isNaN(priceAsFloat)) {
                totalQuantity += quantityAsFloat;
                totalPrice += priceAsFloat;
            } else {
                console.log("Invalid quantity or price for user:", user);
            }
        }

        if (users.length > 0) {
            let aswsPrice = totalPrice / users.length;
            let aswsQuantity = totalQuantity / users.length;

            console.log("ASWS Average Price : ", aswsPrice);
            console.log("ASWS Average Quantity : ", aswsQuantity);

            return {
                aswsPrice: aswsPrice,
                aswsQuantity: aswsQuantity
            };
        } else {
            console.log("No valid users found for calculating ASWS.");
            return {
                aswsPrice: 0,
                aswsQuantity: 0
            };
        }
    }



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
