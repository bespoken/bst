/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {InteractionModel} from "../../lib/alexa/interaction-model";


describe("InteractionModel", function() {
    describe("#fromFiles", function() {
        it("Correctly parses interaction model", function(done) {
            InteractionModel.fromFiles("test/alexa/resources/IntentSchema.json",
                "test/alexa/resources/SampleUtterances.txt",
                function(model: InteractionModel) {
                    assert(model.hasIntent("Test"));
                    assert.equal(model.intentForUtterance("Another Test"), "AnotherTest");
                    done();
                }
            );
        });
    });
});

