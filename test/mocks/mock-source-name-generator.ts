const uuid = require("uuid");

export class SourceNameGenerator {
    public callService() {
        const id = uuid.v4();
        return {
            id,
            secretKey: "unit-test" + id,
        };
    };

    public createDashboardSource () {};
};
