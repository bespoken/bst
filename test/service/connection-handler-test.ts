/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import ConnectionHandler from '../../service/connection-handler';
import * as assert from "assert";

describe('User', function() {
    describe('#save()', function() {
        it('should save without error', function(done) {
            var user = new ConnectionHandler(9999);
            assert.ok(true);
            done();
            //assert.ok(true);
        });
    });
});