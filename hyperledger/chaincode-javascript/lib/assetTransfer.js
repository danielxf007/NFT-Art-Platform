/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                ID: "Monalisa",
                Description: "",
                Maintenance_cost: {"0x035f4563c30bb14dBfDC454361E511731D4BbFe5": 0.005},
                Responsible: "Art Storage",
            },
            {
                ID: "The Birth of Venus",
                Description: "",
                Maintenance_cost: {"0x035f4563c30bb14dBfDC454361E511731D4BbFe5": 0.08},
                Responsible: "Art Storage 2",
            }
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, description, eth_wallet, responsible) {
        const asset = {
            ID: id,
            Description: description,
            Maintenance_cost: JSON.parse(`{"${eth_wallet}": 0}`),
            Responsible: responsible
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }
    
    async UpdateDescription(ctx, id, description){
        const assetString = await this.ReadAsset(ctx, id);
        const assetJSON = JSON.parse(assetString);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        assetJSON.Description = description;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(assetJSON)));
    }

    async AddMaintenanceCost(ctx, id, cost, eth_wallet){
        const assetString = await this.ReadAsset(ctx, id);
        const assetJSON = JSON.parse(assetString);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        let current_cost;
        if(assetJSON.Maintenance_cost[eth_wallet]){
            current_cost = parseFloat(assetJSON.Maintenance_cost[eth_wallet]);
        }else{
            current_cost = 0.0
        }
        current_cost += parseFloat(cost);
        assetJSON.Maintenance_cost[eth_wallet] = current_cost;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(assetJSON)));
    }    

    async PayMaintenanceCost(ctx, id, amount, eth_wallet){
        const assetString = await this.ReadAsset(ctx, id);
        const assetJSON = JSON.parse(assetString);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        let current_cost;
        if(assetJSON.Maintenance_cost[eth_wallet]){
            current_cost = parseFloat(assetJSON.Maintenance_cost[eth_wallet]);
        }else{
            current_cost = 0.0
        }
        current_cost -= parseFloat(amount);
        if(current_cost > 0.0){
            assetJSON.Maintenance_cost[eth_wallet] = current_cost;
        }else{
            delete assetJSON.Maintenance_cost[eth_wallet];
        }
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(assetJSON)));
    }    

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, responsible) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Responsible = responsible;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;
