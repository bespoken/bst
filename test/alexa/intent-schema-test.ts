import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";


describe("IntentSchema", function() {
    let intentJSON: any = {
        "intents": [
            {"intent": "Test"},
            {"intent": "Another Test"},
            {"intent": "AMAZON.HelpIntent"},
            {"intent": "WithSlot",
                "slots": [
                    {"name": "SlotName", "type": "SLOT_TYPE"}
                ]
            },
            {"intent": "WithMultiSlot",
                "slots": [
                    {"name": "SlotName", "type": "SLOT_TYPE"},
                    {"name": "SlotName2", "type": "SLOT_TYPE2"}
                ]
            }
        ]
    };

    describe("#constructor", function() {
        it("Correctly parses intents", function(done) {

            let schema: IntentSchema = new IntentSchema(intentJSON);
            assert.equal(schema.intents().length, 5);
            assert.equal(schema.intents()[1].builtin, false);
            assert.equal(schema.intents()[1].name, "Another Test");
            assert.equal(schema.intents()[2].builtin, true);
            assert.equal(schema.intents()[3].slots.length, 1);
            assert.equal(schema.intents()[3].slots[0].name, "SlotName");
            assert.equal(schema.intents()[3].slots[0].type, "SLOT_TYPE");
            assert.equal(schema.intents()[4].slots.length, 2);
            done();
        });
    });

    describe("#intentName()", function() {
        it("Correctly parses intents", function(done) {
            let schema: IntentSchema = new IntentSchema(intentJSON);
            assert.equal(schema.intent("Test").name, "Test");
            assert.equal(schema.intent("WithSlot").name, "WithSlot");
            done();
        });
    });

    describe("#hasIntent()", function() {
        it("Correctly parses intents", function(done) {
            let schema: IntentSchema = new IntentSchema(intentJSON);
            assert(schema.hasIntent("WithSlot"));
            assert(schema.hasIntent("WithSlot2") === false);
            done();
        });
    });

    describe("#fromJSON()", function() {
        it("Correctly loads schema", function(done) {
            let schema: IntentSchema = IntentSchema.fromJSON(intentJSON);
            assert.equal(schema.intents().length, 5);
            done();
        });
    });

    describe("#fromFile()", function() {
        it("Correctly loads schema", function(done) {
            IntentSchema.fromFile("test/alexa/resources/IntentSchema.json", function (schema: IntentSchema) {
                assert.equal(schema.intents().length, 5);
                done();
            });
        });

        it("Passes error when files does not exist", function(done) {
            IntentSchema.fromFile("test/alexa/resources/IntentSchemaNonExistent.json", function (schema: IntentSchema, error?: string) {
                assert(error.indexOf("not found") !== -1);
                done();
            });
        });

        it("Passes error with bad JSON", function(done) {
            IntentSchema.fromFile("test/alexa/resources/IntentSchemaBad.txt", function (schema: IntentSchema, error?: string) {
                assert(error.indexOf("Bad JSON") !== -1);
                done();
            });
        });
    });
});
