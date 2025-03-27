/**
 * Choice - used in inquirer.js select prompts. Defined by the library but not
 * exported, added here for conventience. Will soon be available from the
 * @dwmkerr/inquirer-prompts library.
 */
export type Choice<Value> = {
  value: Value;
  name: string;
  description: string;
  short?: string;
  disabled?: boolean | string;
};
