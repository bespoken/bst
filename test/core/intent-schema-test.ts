/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/core/intent-schema";


describe("IntentSchema", function() {
    describe("#parse", function() {
        it("Correctly parses intents", function(done) {
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
});
