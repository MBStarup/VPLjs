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
