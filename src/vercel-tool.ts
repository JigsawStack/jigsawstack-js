import { z } from "zod";

// Match the AI SDK's exact interface
export type ToolParameters = z.ZodTypeAny;

export interface ToolExecutionOptions {
  toolCallId: string;
  messages: any[];
  abortSignal?: AbortSignal;
}

export type inferParameters<PARAMETERS extends ToolParameters> = PARAMETERS extends z.ZodTypeAny ? z.infer<PARAMETERS> : never;

// This interface matches exactly what AI SDK expects
export interface Tool<PARAMETERS extends ToolParameters = any, RESULT = any> {
  /**
   * The schema of the input that the tool expects.
   */
  parameters: PARAMETERS;

  /**
   * An optional description of what the tool does.
   */
  description?: string;

  /**
   * An async function that is called with the arguments from the tool call.
   */
  execute?: (args: inferParameters<PARAMETERS>, options: ToolExecutionOptions) => PromiseLike<RESULT>;

  /**
   * Function tool (default type)
   */
  type?: undefined | "function";
}

// Your custom tool function - returns AI SDK compatible objects
export function tool<PARAMETERS extends ToolParameters, RESULT>(toolDefinition: Tool<PARAMETERS, RESULT>): Tool<PARAMETERS, RESULT> {
  // Ensure the tool has the correct type
  return {
    type: "function" as const,
    ...toolDefinition,
  };
}
