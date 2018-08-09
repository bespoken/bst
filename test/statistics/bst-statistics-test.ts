import * as assert from "assert";
import {BstStatistics, BstCommand, BstEvent, SOURCE_API_URL} from "../../lib/statistics/bst-statistics";
import * as nock from "nock";

describe("BstStatistics", function() {
    describe("#record()", function() {
        it("send bst stats to source api", function(done) {
            nock(`https://${SOURCE_API_URL}`)
                .persist()
                .post("/v1/postBstStats", (body: any) => {
                    return true;
                })
                .reply(200, (uri, requestBody) => {
                    return {bstStats: requestBody.bstStats.length};
                });

            BstStatistics.instance().record(BstCommand.proxy, BstEvent.connect, undefined, function(error) {
                assert(!error);
                done();
            });
        });
    });
});