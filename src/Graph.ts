class Graph {
    Nodes: GraphNode[];
    Relations: GraphRelation;
}

class GraphNode {
    Inputs: GraphPlug[];
    Outputs: GraphPlug[];

    void(ins: GraphPlug[], outs: GraphPlug[]) {
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
