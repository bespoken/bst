import * as assert from "assert";
import {Statistics, AccessType} from "../../lib/server/statistics";
const uuid = require("node-uuid");

const awsAccessKeyId = process.env["AWS_ACCESS_KEY_ID"];
const awsSecretAccessKey = process.env["AWS_SECRET_ACCESS_KEY"];

describe("StatisticsTest", function() {

    describe("#capture()", function() {
        it("Captures Node ID stats", function(done) {
            Statistics.Table = "bst-stats-test";

            if (doNotRun(this, done)) return;

            this.timeout(5000);
            const stats = new Statistics();

            const nodeID = uuid.v4();
            stats.record(nodeID, AccessType.CONNECT, function (error: Error) {
                assert(!error);
                stats.record(nodeID, AccessType.REQUEST, function (error: Error) {
                    assert(!error);
                    done();
                });
            });
        });
    });

    describe("#delete()", function() {
        it("Creates and deletes table", function(done) {
            if (doNotRun(this, done)) return;

            Statistics.Table = "bst-stats-delete";
            this.timeout(10000);

            const stats = new Statistics();

            const nodeID = uuid.v4();
            stats.record(nodeID, AccessType.CONNECT, function () {
                stats.deleteTable(function() {
                    done();
                });
            });
        });
    });

});

function doNotRun(test: any, done: Function) {
    if (awsAccessKeyId === undefined || awsSecretAccessKey === undefined) {
        console.warn("AWS dependent test skipped. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be set for these tests");
        done();
        return true;
    }
}