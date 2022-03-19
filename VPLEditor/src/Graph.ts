class Graph {
    Nodes: GraphNode[];
    Relations: GraphRelation;
}

class GraphNode {
    Inputs: GraphPlug[];
    Outputs: GraphPlug[];

    constructor(ins: GraphPlug[], outs: GraphPlug[]) {
        this.Inputs = ins;
        this.Outputs = outs;
    }
}

class GraphPlug {
    Type: GraphType;
    HasIn: boolean;
    HasField: boolean;

    constructor(type: GraphType) {
        this.Type = type
    }
}

class GraphRelation {
    From: GraphPlug;
    To: GraphPlug;
}

enum GraphType {
    Num,
    Text,
    Bool,
    User,
    Message,
    Time,
    Channel,
    Category,
    Emoji,
    MessageType
}

class Pair<keyType, valueType> {
    key: keyType;
    value: valueType;

    constructor(key: keyType, value: valueType) {
        this.key = key;
        this.value = value;
    }
}
