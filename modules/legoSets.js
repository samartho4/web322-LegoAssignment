// Data base
const Sequelize = require('sequelize');
const env = require('dotenv');
const path = require('path');
env.config({ path: path.resolve(__dirname, '../.env') });

// variables
let sets = [];

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT || 5432,
  dialectOptions: {
      ssl: {
          rejectUnauthorized: false
      }
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
});

// defining theme and set model
const Theme = sequelize.define('Theme', {
  id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
  name: {
      type: Sequelize.STRING,
      allowNull: false
  }
}, {
  createdAt: false, // disable createdAt
  updatedAt: false, // disable updatedAt
});

const Set = sequelize.define('Set', {
  set_num: {
      type: Sequelize.STRING,
      primaryKey: true
  },
  name: {
      type: Sequelize.STRING,
  },
  year: {
      type: Sequelize.INTEGER,
  },
  num_parts: {
      type: Sequelize.INTEGER,
  },
  theme_id: {
      type: Sequelize.INTEGER,
      references: {
          model: Theme, 
          key: 'id'     
      },
  },
  img_url: {
      type: Sequelize.STRING,
  }
}, {
  createdAt: false, // disable createdAt
  updatedAt: false, // disable updatedAt
});

// Association
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// initialize sets
module.exports.initialize = () => {
    return sequelize.sync()
        .then(() => {
            console.log('Database synchronized successfully');
            return Promise.resolve();
        })
        .catch(error => {
            console.error('Error synchronizing database:', error);
            return Promise.reject(error);
        });
}

// return all sets
module.exports.getAllSets = async () => {
  return new Promise((resolve, reject) => {
    Set.findAll({
        include: [{
            model: Theme,
            as: 'Theme'
        }]
    })
    .then(sets => {
        resolve(sets);
    })
    .catch(error => {
        reject(error.message);
    });
});
};

// returns a set by num
module.exports.getSetByNum = async (setNum) => {
  return new Promise((resolve, reject) => {
    Set.findAll({
        where: { set_num: setNum },
        include: [{
            model: Theme,
            as: 'Theme'
        }]
    })
    .then(sets => {
        if (sets.length > 0) {
            resolve(sets[0]);
        } else {
            reject('Unable to find requested set');
        }
    })
    .catch(error => {
        reject(error.message);
    });
});
};

// return sets that match the given theme
module.exports.getSetsByTheme = async (theme) => {
  return new Promise((resolve, reject) => {
    Set.findAll({
        include: [{
            model: Theme,
            as: 'Theme'
        }],
        where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`
            }
        }
    })
    .then(sets => {
        if (sets.length > 0) {
            resolve(sets);
        } else {
            reject(`Unable to find requested sets`);
        }
    })
    .catch(error => {
        reject(error.message);
    });
});
};

// Database functions
module.exports.addSet = (setData) => {
  return Set.create(setData)
      .then(() => {})
      .catch(err => {
          throw new Error(err.errors[0].message);
      });
}

module.exports.getAllThemes = () => {
  return Theme.findAll()
      .then(themes => themes)
      .catch(err => {
          throw new Error(err.message);
      });
}

module.exports.editSet = (set_num, setData) => {
  return new Promise((resolve, reject) => {
      Set.update(setData, {
          where: { set_num: set_num }
      })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

module.exports.deleteSet = (set_num) => {
  return new Promise((resolve, reject) => {
      Set.destroy({
          where: { set_num: set_num }
      })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

// Initialize();

// console.log("sets", getAllSets().length);

// console.log("set by num", getSetByNum("077-1").name);

// console.log("set by theme", getSetsByTheme("Supplemental").length);


