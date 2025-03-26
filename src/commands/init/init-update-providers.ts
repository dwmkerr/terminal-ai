import { ExecutionContext } from "../../execution-context/execution-context";
import { selectEditOrAddProvider } from "./select/select-edit-or-add-provider";
import { editProvider } from "./select/edit-provider";

export async function initUpdateProviders(executionContext: ExecutionContext) {
  //  Get all of the providers and check whether we're editing/adding a new one.
  const providers = Object.values(executionContext.config.providers);
  const editOrAdd = await selectEditOrAddProvider(
    executionContext.provider,
    providers,
  );

  //  If we're editing a provider, do so now.
  if (editOrAdd?.editProvider) {
    await editProvider(editOrAdd.editProvider);
  } else if (editOrAdd?.addProvider) {
    //  If no provider added, we edit a new one.
    await editProvider();
  }
}
