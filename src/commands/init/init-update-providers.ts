import { confirm } from "@inquirer/prompts";
import { ExecutionContext } from "../../execution-context/execution-context";
import { addOrEditProvider } from "./select/add-or-edit-provider";
import { selectEditOrAddProvider } from "./select/select-edit-or-add-provider";
import { updateConfigurationFile } from "../../configuration/update-configuration-file";

export async function initUpdateProviders(executionContext: ExecutionContext) {
  //  Get all of the providers and check whether we're editing/adding a new one.
  const providers = Object.values(executionContext.config.providers);
  const editOrAdd = await selectEditOrAddProvider(
    executionContext.provider,
    providers,
  );

  //  If we're editing a provider, do so now.
  let provider = null;
  let makeCurrent = false;
  if (editOrAdd?.editProvider) {
    provider = await addOrEditProvider(editOrAdd.editProvider);

    //  If the provider is not current, we'll ask if they want to make it so.
    //  Remember that 'edit' doesn't let you change the name, so the below is
    //  safe.
    if (executionContext.provider.name !== provider.name) {
      makeCurrent = await confirm({
        message: "Set as current provider?",
        default: false,
      });
    } else {
      //  The provider *is* current, so update it in the execution context.
      executionContext.provider = provider;
    }

    //  Update the provider, make current if we need to.
  } else if (editOrAdd?.addProvider) {
    //  If we chose to add, do so now.
    provider = await addOrEditProvider();
    makeCurrent = await confirm({
      message: "Set as current provider?",
      default: false,
    });
  }

  //  Add the provider to the config, set as current.
  if (provider) {
    updateConfigurationFile(executionContext.configFilePath, {
      [`providers.${provider.name}`]: provider,
    });
    if (makeCurrent) {
      executionContext.provider = provider;
      updateConfigurationFile(executionContext.configFilePath, {
        [`provider`]: provider.name,
      });
    }
  }
}
