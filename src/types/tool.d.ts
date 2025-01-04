export type ToolFunction<Args extends any[] = any[], Return = any> = (...args: Args) => Return;

export interface ToolOptions {
    description: string;
    name?: string;
}

export function Tool<T extends ToolFunction>(
    options: ToolOptions
): (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;