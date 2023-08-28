'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class AuctionWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        const assets = [
            { agentID: 'agent1', pv: Math.floor(Math.random() * 100) },
            { agentID: 'agent2', pv: Math.floor(Math.random() * 100) },
            { agentID: 'agent3', pv: Math.floor(Math.random() * 100) },
            { agentID: 'agent4', pv: Math.floor(Math.random() * 100) },
            { agentID: 'agent5', pv: Math.floor(Math.random() * 100) },
            { agentID: 'agent6', pv: Math.floor(Math.random() * 100) },
        ];

        for (const asset of assets) {
            const request = {
                contractId: roundArguments.contractId,
                contractFunction: 'registerEnrollUser',
                invokerIdentity: 'admin',  // Assuming admin role can create agents
                contractArguments: [asset.agentID, asset.pv.toString()],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }

async submitTransaction() {
    // Choose a random agent to submit a bid
    const randomAgentIndex = Math.floor(Math.random() * 6); // Assuming you have 6 agents
    const agentID = `agent${randomAgentIndex + 1}`;

    // Generate a random bid amount
    const bidAmount = Math.floor(Math.random() * 100);

    // Prepare the bid transaction request
    const bidRequest = {
        contractId: this.roundArguments.contractId,
        contractFunction: 'Bid',
        invokerIdentity: agentID,
        contractArguments: [this.roundArguments.auctionID, bidAmount.toString()],
        readOnly: false
    };

    // Submit the bid transaction
    await this.sutAdapter.sendRequests(bidRequest);
}


    async cleanupWorkloadModule() {
        // You can implement cleanup logic here if needed
    }
}

function createWorkloadModule() {
    return new AuctionWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

