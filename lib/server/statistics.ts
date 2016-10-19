const AWS = require("aws-sdk");

export class Statistics {
    public static Table = "bst-stats";

    public constructor () {
        this.configure();
    }

    private configure () {
        AWS.config.update({
            region: "us-east-1"
        });
    }

    public deleteTable(deleted: () => void): void {
        const dynamoClient = new AWS.DynamoDB();
        const dynamoParams = {
            TableName: Statistics.Table
        };

        dynamoClient.deleteTable(dynamoParams, function() {
            deleted();
        });
    }

    public createTable(created: () => void): void {
        const dynamoClient = new AWS.DynamoDB();

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
        const self = this;

        const timestamp = new Date().toISOString();
        const dynamoClient = new AWS.DynamoDB.DocumentClient();
        const dynamoParams = {
            TableName: Statistics.Table,
            Item: {
                "nodeID": nodeID,
                "timestamp": timestamp,
                "accessType": AccessType[accessType]
            }
        };

        console.log("Access Node: " + nodeID + " Time: " + timestamp + " Access: " + AccessType[accessType]);
        dynamoClient.put(dynamoParams, function(error: any, data: any) {
            if (error) {
                console.assert(error.code, "ResourceNotFoundException");
                self.createTable(function () {
                    self.record(nodeID, accessType, confirmation);
                });
            } else {
                confirmation();
            }
        });
    }
}

export enum AccessType {
    CONNECT,
    REQUEST
}