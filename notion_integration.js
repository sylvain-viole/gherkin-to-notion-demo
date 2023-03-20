import { FileHandler } from "./living_documentation/FileHandler.js";
import { FeatureObjectHandler } from "./living_documentation/FeatureObjectHandler.js";
import { NotionDoc } from "./living_documentation/NotionDoc.js";

const FEATURE_FOLDER = "./features";
const notionDoc = new NotionDoc(process.env.NOTION_DB_ID);
const fileHandler = new FileHandler(FEATURE_FOLDER);
const featureFiles = fileHandler.getFilesByExtension("feature");

(async () => {
  try {
    console.log("🚮 Cleaning DB");
    await notionDoc.clear();
    console.log("=> ✅ DB cleaned");
    do {
      const feature = new FeatureObjectHandler(featureFiles[0]);
      const name = feature.getName();
      const scenarios = feature.getScenariosNames();
      const tags = feature.getTagsAsObject();
      const categories = feature.getTagsCategories();
      const gherkinContent = fileHandler.getFileContent(featureFiles[0]);
      console.log(`🚀 Sending ${name} to DB`);
      const page = await notionDoc.createItem(name, scenarios, categories, tags);
      await notionDoc.addGherkinBlock(page.id, gherkinContent);
      featureFiles.shift();
    } while (featureFiles.length);
    console.log(`=> ✅ All sent`);
  } catch (err) {
    console.error(err);
  }
})();
