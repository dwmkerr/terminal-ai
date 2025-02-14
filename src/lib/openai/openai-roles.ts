//  Note the message roles are not defined in the OpenAI library as an enum or
//  similar, so we hard code them here. For reference, see the
//  'ChatCompletionMessageParam' type.
//  Note that 'tool' and 'function' are not defined as chat roles as they
//  require extra parameters such as 'name'. These will be handled separately.
export type OpenAIChatRoles = "developer" | "system" | "assistant" | "user";
