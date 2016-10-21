const AWS = require("aws-sdk");

export class Statistics {
    public static Table = "bst-stats";
    private static Singleton = new Statistics();

    private _dynamoClient: any = null;
    private _docClient: any = null;

    public static instance(): Statistics {
        return Statistics.Singleton;
    }

    private dynamoClient (): any {
        this.configure();
        if (this._dynamoClient === null) {
            this._dynamoClient = new AWS.DynamoDB();
        }
        return this._dynamoClient;
    }

    private docClient (): any {
        this.configure();
        if (this._docClient === null) {
            console.time("OpenClient");
            this._docClient = new AWS.DynamoDB.DocumentClient({
                maxRetries: 0
            });
            console.timeEnd("OpenClient");
        }
        return this._docClient;
    }

    private configure () {
        AWS.config.update({
            region: "us-east-1"
        });
    }

    public deleteTable(deleted: () => void): void {
        const dynamoClient = this.dynamoClient();
        const dynamoParams = {
            TableName: Statistics.Table
        };

        dynamoClient.deleteTable(dynamoParams, function() {
            deleted();
        });
    }

    public createTable(created: () => void): void {
        const dynamoClient = this.dynamoClient();

        const dynamoParams = {
            TableName : Statistics.Table,
            KeySchema: [
                { AttributeName: "nodeID", KeyType: "HASH"},  // Partition key
                { AttributeName: "timestamp", KeyType: "RANGE" }  // Sort key
            ],
            AttributeDefinitions: [
                { AttributeName: "nodeID", AttributeType: "S" },
                { AttributeName: "timestamp", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };

        dynamoClient.createTable(dynamoParams, function() {
            created();
        });
    }

    public record (nodeID: string, accessType: AccessType, confirmation?: (error?: Error) => void) {
        console.time("Statistics.record");
        const self = this;
        const timestamp = new Date().toISOString();
        const docClient = this.docClient();

        const dynamoParams = {
            TableName: Statistics.Table,
            Item: {
                "nodeID": nodeID,
                "timestamp": timestamp,
                "accessType": AccessType[accessType]
            }
        };

        console.log("Access Node: " + nodeID + " Time: " + timestamp + " Access: " + AccessType[accessType]);
        docClient.put(dynamoParams, function(error: any) {
            if (error) {
                console.error("DynamoPutError: " + error);
                console.assert(error.code, "ResourceNotFoundException");
                self.createTable(function () {
                    self.record(nodeID, accessType, confirmation);
                });
            } else {
                if (confirmation !== undefined) {
                    confirmation();
                }
            }
        });
        console.timeEnd("Statistics.record");
    }
}

export enum AccessType {
    CONNECT,
    REQUEST_FORWARDED,
    REQUEST_DROPPED
}