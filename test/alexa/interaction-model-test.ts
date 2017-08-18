import * as assert from "assert";
import {InteractionModel} from "../../lib/alexa/interaction-model";


describe("InteractionModel", function() {
    describe("#fromFiles", function() {
        it("Correctly parses interaction model", function(done) {
            InteractionModel.fromFiles("test/alexa/resources/IntentSchema.json",
                "test/alexa/resources/SampleUtterances.txt",
                function(model: InteractionModel) {
                    assert(model.hasIntent("Test"));
                    assert.equal(model.intentForUtterance("Another Test").intentName, "AnotherTest");
                    done();
                }
            );
        });

        it("Correctly parses another interaction model", function(done) {
            InteractionModel.fromFiles("test/resources/speechAssets/SimpleIntentSchema.json",
                "test/resources/speechAssets/SimpleSampleUtterances.txt",
                function(model: InteractionModel, error?: string) {
                    assert(model);
                    done();
                }
            );
        });

        it("Cannot find a file", function(done) {
            InteractionModel.fromFiles("test/alexa/resources/IntentSchema2.json",
                "test/alexa/resources/SampleUtterances.txt",
                function(model: InteractionModel, error: string) {
                    assert.equal(error, "File not found: test/alexa/resources/IntentSchema2.json");
                    done();
                }
            );
        });
    });
});

