'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class AuctionWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        const createAuctionRequest = {
            contractId: roundArguments.contractId,
            contractFunction: 'createAuction',
            invokerIdentity: 'User1',
            contractArguments: ['org1', 'agent1', 'auction1', 'item1'],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(createAuctionRequest);
    }

    async closeAuction() {
        const closeAuctionRequest = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'closeAuction',
            invokerIdentity: 'User1',
            contractArguments: ['org1', 'agent1', 'auction1'],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(closeAuctionRequest);
    }

    async revealBid() {
        const revealBidRequest = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'revealBid',
            invokerIdentity: 'User1',
            contractArguments: ['org1', 'agent1', 'auction1'],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(revealBidRequest);
    }

    async submitTransaction() {
        // Choose a random agent to submit a bid
        const randomAgentIndex = Math.floor(Math.random() * 6);
        const agentID = `agent${randomAgentIndex + 1}`;

        // Generate a random bid amount
        const bidAmount = Math.floor(Math.random() * 100);

        const bidRequest = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'bid',
            invokerIdentity: agentID,
            contractArguments: ['org1', agentID, 'auction1', bidAmount.toString()],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(bidRequest);
    }

    async cleanupWorkloadModule() {
        await this.closeAuction(); // Close the auction
        await this.revealBid(); // Reveal the bids

        const endAuctionRequest = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'endAuction',
            invokerIdentity: 'User1',
            contractArguments: ['org1', 'agent1', 'auction1'],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(endAuctionRequest);
    }
}

function createWorkloadModule() {
    return new AuctionWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

