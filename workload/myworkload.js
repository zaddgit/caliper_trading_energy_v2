'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        // Accessing contractId and users from roundArguments
        const contractId = this.roundArguments.contractId;
        const users = this.roundArguments.users;

        for (let i = 0; i < this.roundArguments.users; i++) {
            const userID = `user_${this.workerIndex}_${i}`;
            const userJSON = JSON.stringify({
                XMax: [(Math.floor(Math.random() * 100) + 1).toString(), (Math.floor(Math.random() * 100) + 1).toString()],
                SurplusEnergy: [(Math.floor(Math.random() * 50) + 1).toString(), (Math.floor(Math.random() * 50) + 1).toString()],
                Prices: [(Math.floor(Math.random() * 100) + 10).toString(), (Math.floor(Math.random() * 100) + 10).toString()],
                Identify: userID,
                ClearPrice: [(Math.floor(Math.random() * 50) + 10).toString(), (Math.floor(Math.random() * 50) + 10).toString()],
                ClearQuantity: [(Math.floor(Math.random() * 10) + 1).toString(), (Math.floor(Math.random() * 10) + 1).toString()]
            });

            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'InitLedger',
                invokerIdentity: 'User1',
                contractArguments: [userJSON],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }

    async submitTransaction() {
        
    }

    async cleanupWorkloadModule() {
        // NOOP
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

