import OpenAI from "openai";
import { translateError } from "../../lib/translate-error";
import { printWarning, startSpinner } from "../../theme";

export async function checkOpenAIModel(
  interactive: boolean,
  openai: OpenAI,
  model: string,
) {
  //  See if we can list models, this'll check the key...
  const spinner = await startSpinner(interactive, `Checking Model ${model}...`);
  let apiModels: string[] = [];
  try {
    //  Get all of the OpenAI API models.
    let page = await openai.models.list();
    while (page) {
      apiModels = [...apiModels, ...page.data.map((m) => m.id)];
      if (!page.hasNextPage()) {
        break;
      }
      page = await page.getNextPage();
    }
  } catch (err) {
    console.log(err);
    spinner.stop();
    throw translateError(err);
  }
  spinner.succeed();

  if (apiModels.includes(model) === false) {
    console.log(
      printWarning(
        `⚠️ Warning: Your Model '${model}' in not in any of the ${apiModels.length} models currently listed by the provider - this *may* indicate misconfiguration`,
        interactive,
      ),
    );
  }
}
