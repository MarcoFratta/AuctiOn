export interface Converter<Input, Output> {
  convert(input: Input): Output;
}
