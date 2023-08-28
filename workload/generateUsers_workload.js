'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
	console.log('Arguments inside initializeWorkloadModule: ', JSON.stringify({
	  workerIndex,
	  totalWorkers,
 	  roundIndex,
	  roundArguments,
	  sutAdapter,
	  sutContext
	}));

	const totalUsers = roundArguments.totalUsers;
        this.users = [];

        for (let i = 0; i < totalUsers; i++)  {
            const userID = `User_${workerIndex}_${i}`;
            const user = {
                XMax: [],
                SurplusEnergy: [],
                Prices: [],
                Identify: userID,
                ClearPrice: [],
                ClearQuantity: [],
            };

            console.log(`Worker ${workerIndex}: Creating user ${userID}`);
            const request = {
                contractId: 'smartcontract_1.0',
                contractFunction: 'AddUser',
                invokerIdentity: 'User1',
                contractArguments: [JSON.stringify(user)],
                readOnly: false,
            };

            await this.sutAdapter.sendRequests(request);
            this.users.push(user);
        }
    }

    async submitTransaction() {
        const randomIndex = Math.floor(Math.random() * this.users.length);
        const user = this.users[randomIndex];
        const userID = user.Identify;

        console.log(`Worker ${this.workerIndex}: Querying user ${userID}`);
        const request = {
            contractId: 'smartcontract_1.0',
            contractFunction: 'QueryUser',
            invokerIdentity: 'User1',
            contractArguments: [userID],
            readOnly: true,
        };

        await this.sutAdapter.sendRequests(request);
    }

    async cleanupWorkloadModule() {
        // Cleanup code if required
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

