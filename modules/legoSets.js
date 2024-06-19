// import data
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// variables
let sets = [];

// initialize sets
module.exports.initialize = async () => {
  return new Promise((resolve, reject) => {
    setData.forEach((set) => {
      // get theme by id
      set.theme = themeData.find((theme) => set.theme_id === theme.id)?.name;
      sets.push(set);
    });

    resolve();
  });
};
// return all sets
module.exports.getAllSets = async () => {
  return new Promise((resolve, reject) => {
    resolve(sets);
  });
};

// returns a set by num
module.exports.getSetByNum = async (setNum) => {
  return new Promise((resolve, reject) => {
    const set = sets.find((x) => x.set_num === setNum);
    if (set) resolve(set);
    else reject("unable to find requested set");
  });
};

// return sets that match the given theme
module.exports.getSetsByTheme = async (theme) => {
  return new Promise((resolve, reject) => {
    const themeSets = sets.filter((set) =>
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    if (themeSets.length > 0) resolve(themeSets);
    else reject("unable to find requested sets");
  });
};

// Initialize();

// console.log("sets", getAllSets().length);

// console.log("set by num", getSetByNum("077-1").name);

// console.log("set by theme", getSetsByTheme("Supplemental").length);
