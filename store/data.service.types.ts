import z from "zod";


const PositionType = z.object({
    x: z.number(),
    y: z.number()
});

const VariableNodeDataType = z.object({
    label: z.string(),
    nodeType: z.literal("variable"),
    observableQuestions: z.number(),
    likertScale: z.number(),
    average: z.number(),
    standardDeviation: z.number()
});

const ModerateEffectNodeDataType = z.object({
    label: z.string(),
    nodeType: z.literal("moderate_effect"),
    moderateVariable: z.string(),
    independentVariable: z.string(),
    effectType: z.enum(["positive", "negative"])
});

const NodeDataType = z.union([VariableNodeDataType, ModerateEffectNodeDataType]);

export type ModerateEffectNodeDataType = z.infer<typeof ModerateEffectNodeDataType>;
export type VariableNodeDataType = z.infer<typeof VariableNodeDataType>;

const NodeType = z.object({
    id: z.string(),
    data: NodeDataType,
    position: PositionType
});

const EdgeDataType = z.object({
    effectType: z.enum(["positive", "negative"])
});

const EdgeType = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    data: EdgeDataType
});

const AdvanceModelSchema = z.object({
    name: z.string(),
    nodes: z.array(NodeType),
    edges: z.array(EdgeType)
});

export type AdvanceModelType = z.infer<typeof AdvanceModelSchema>;
export type NodeDataType = z.infer<typeof NodeDataType>;
export type EdgeDataType = z.infer<typeof EdgeDataType>;