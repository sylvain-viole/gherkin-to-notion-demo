const fs = require("fs");
const path = require("path");
const gherkinParser = require("gherkin-parse");
const { Client } = require("@notionhq/client");

const NOTION_SECRET = process.env.NOTION_SECRET;
const NOTION_DB_ID = process.env.NOTION_DB_ID;
const FEATURE_FOLDER = "./features";

// Initializing a client
const notion = new Client({
  auth: NOTION_SECRET,
});

/**
 *
 * @param {string} dir a path
 * @returns {array} of files
 */
const getFeatureFiles = (dir) => {
  let files = fs.readdirSync(dir);
  files = files.map((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) return getFeatureFiles(filePath);
    else if (stats.isFile()) return filePath;
  });
  return files
    .reduce((all, folderContents) => all.concat(folderContents), [])
    .filter((file) => path.extname(file).toLowerCase() === ".feature");
};

/**
 *
 * @param {array} files array of files
 * @returns {Object}
 */
const getFeatureFilesAsObject = (files) => {
  const object = [];
  files.forEach((file) => {
    const jsonFeature = gherkinParser.convertFeatureFileToJSON(file);
    object.push(jsonFeature);
  });
  return object;
};

/**
 * @param {object} fileObject
 * @returns {string} feature name
 */
const getFeatureName = (fileObject) => {
  return fileObject.feature.name;
};

/**
 * @param {object} fileObject
 * @returns {string} feature name
 */
const getFeatureScenarios = (fileObject) => {
  let scenarios = [];
  fileObject.feature.children.forEach((child) => {
    child.type === "Scenario" && scenarios.push(`- ${child.name}`);
  });
  return scenarios;
};

/**
 * @param {Object} file feature file object
 * @returns {Array} array of tags objects
 */
const getAllTagsFromFile = (file) => {
  let tags = [];
  file.feature.tags.forEach((tag) => {
    tags.push(tag);
  });
  file.feature.children.forEach((child) => {
    if (child?.tags) {
      child.tags.forEach((tag) => {
        tags.push(tag);
      });
    }
  });
  return tags;
};

/**
 * @param {string} tag
 * @param {string} prefix
 * @returns {string}
 */
const removePrefix = (tag, prefix) => {
  return tag.replace(prefix, "");
};

/**
 * @param {string} prefix
 * @param {Object} tags
 * @returns {array} of unique tag names
 */
const getUniqueTagsByPrefix = (prefix, tags) => {
  const filteredTags = tags.filter((tag) => tag.name.includes(prefix));
  const result = filteredTags.map(
    (tag) => removePrefix(tag?.name, prefix) || "nc"
  );
  return [...new Set(result)];
};

/**
 *
 * @param {array} array
 * @returns {array} of objects
 */
const setAsMultiselect = (array) => {
  return array.map((element) => {
    return {
      name: element,
    };
  });
};

/**
 * @param {Object} file
 * @param {string} DBId
 */
const createPageFromFile = async (file, DBId) => {
  const featureName = getFeatureName(file);
  const scenarios = getFeatureScenarios(file);
  const tags = getAllTagsFromFile(file);
  const browsers = getUniqueTagsByPrefix("@browser_", tags);
  const squads = getUniqueTagsByPrefix("@squad_", tags);
  const environments = getUniqueTagsByPrefix("@env_", tags);

  return await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: DBId,
    },
    properties: {
      Scenarios: {
        type: "rich_text",
        rich_text: [
          {
            type: "text",
            text: {
              content: scenarios.join("\n"),
            },
            plain_text: scenarios.join("\n"),
          },
        ],
      },
      Browsers: {
        type: "multi_select",
        multi_select: setAsMultiselect(browsers),
      },
      Squads: {
        type: "multi_select",
        multi_select: setAsMultiselect(squads),
      },
      Environments: {
        type: "multi_select",
        multi_select: setAsMultiselect(environments),
      },
      Features: {
        id: "title",
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: featureName,
            },
            plain_text: featureName,
          },
        ],
      },
    },
  });
};

const cleanDB = async (DBId) => {
  const results = await notion.databases.query({ database_id: DBId });
  if (results.length) {
    response.results.forEach((page) => {
      notion.pages.update({ page_id: page.id, archived: true });
    });
  }
};

const logDB = async (DBId) => {
  const response = await notion.databases.retrieve({ database_id: DBId });
  console.log(response);
};

const files = getFeatureFiles(FEATURE_FOLDER);
const featureObject = getFeatureFilesAsObject(files);
(async () => {
  try {
    console.log(`🚮 Cleaning db ${NOTION_DB_ID}`);
    await cleanDB(NOTION_DB_ID);
    console.log(`✅ Cleaned db ${NOTION_DB_ID}`);
    console.log(`Sending Gherkin to db ${NOTION_DB_ID}`);
    do {
      console.log(
        `🚀 Sending Feature "${getFeatureName(
          featureObject[0]
        )}" to db ${NOTION_DB_ID}`
      );
      await createPageFromFile(featureObject[0], NOTION_DB_ID);
      featureObject.shift();
    } while (featureObject.length);
    console.log(`✅ Gherkin sent to db ${NOTION_DB_ID}`);
  } catch (err) {
    console.error(err.body);
  }
})();
