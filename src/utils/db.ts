import { MongoClient, Db } from "mongodb";
import { log, CommandObject } from "arcybot";

type DB = {
  symbol: string;
  url?: string;
};

export class Database {
  public dbs: Record<string, Db> = {};

  constructor(public config: DB[]) {}

  public init = async () => {
    this.config.forEach(c => this.connectToDbClient(c));
    log.INFO("Database successfully initialized!");
  };

  connectToDbClient = async (db: DB): Promise<void> => {
    try {
      if (!db.url) throw new Error(`Database: ${db.symbol} URL not provided`);
      const client = new MongoClient(db.url);
      this.dbs[db.symbol] = client.db(db.symbol);
    } catch (err) {
      log.WARN(`Error while connecting to database: ${err}`);
    }
  };

  getCommands = async () => {
    const cursor = this.dbs.fetus.collection("commands").find();
    const commands: CommandObject[] = [];
    await cursor.forEach(el => {
      commands.push(el as unknown as CommandObject);
    });
    return commands;
  };
}

// export const updateCache = (dbSymbol: string): Promise<void> =>
//   new Promise(resolve =>
//     cache["dbs"][dbSymbol].listCollections().toArray((err, collections) => {
//       collections.map((collection, index) => {
//         findCollection(cache["dbs"][dbSymbol], collection.name, (err, data) => {
//           err ? log.WARN(err) : (cache[collection.name] = data);
//         });
//         if (index === collections.length - 1) {
//           resolve();
//         }
//       });
//     }),
//   );

// export const insertData = (
//   dbSymbol: string,
//   col: string,
//   key: string,
//   value: string,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol]
//     .collection(col)
//     .insertOne({ [key]: value }, (err: any) => {
//       if (err) {
//         log.WARN(`Error during inserting ${key.toUpperCase()} data.`);
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully added data to ${dbSymbol.toUpperCase()}.${col.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     });
// };

// export const insertMany = (
//   dbSymbol: string,
//   collection: string,
//   manyanys: Array<any>,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol]
//     .collection(collection)
//     .insertMany(manyanys, (err: any) => {
//       if (err) {
//         log.WARN("Error during inserting data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully added data to ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     });
// };

// export const updateOne = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   set: any,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol].collection(collection).updateOne(
//     filter,
//     { $set: set },
//     // { $unset: unset },
//     err => {
//       if (err) {
//         log.WARN("Error during updating data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully updated data in ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     },
//   );
// };

// export const updateMany = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   set: Array<any>,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol].collection(collection).updateMany(
//     filter,
//     { $set: set },
//     // { $unset: unset },
//     err => {
//       if (err) {
//         log.WARN("Error during updating data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully updated data in ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     },
//   );
// };

// export const replaceOne = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   replacement: any,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol]
//     .collection(collection)
//     .replaceOne(filter, replacement, { upsert: true }, err => {
//       if (err) {
//         log.WARN("Error during replacing data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully replaced data in ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     });
// };

// export const replaceMany = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   replacement: Array<any>,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol]
//     .collection(collection)
//     .replaceMany(filter, replacement, { upsert: true }, err => {
//       if (err) {
//         log.WARN("Error during replacing data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully replaced data in ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     });
// };

// export const upsertOne = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   any: any,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol]
//     .collection(collection)
//     .updateOne(filter, { $set: any }, { upsert: true }, err => {
//       if (err) {
//         log.WARN("Error during upserting data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully upserted data to ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     });
// };

// export const upsertMany = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   manyanys: Array<any>,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol]
//     .collection(collection)
//     .updateMany(filter, { $set: manyanys }, { upsert: true }, err => {
//       if (err) {
//         log.WARN("Error during upserting data.");
//         return cb(err);
//       }
//       updateCache(dbSymbol);
//       log.INFO(
//         `Succesfully upserted data to ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//       );
//       return cb(null);
//     });
// };

// export const deleteOne = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol].collection(collection).deleteOne(filter, err => {
//     if (err) {
//       log.WARN("Error during deleting data.");
//       return cb(err);
//     }
//     updateCache(dbSymbol);
//     log.INFO(
//       `Succesfully deleted data from ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//     );
//     return cb(null);
//   });
// };

// export const deleteMany = (
//   dbSymbol: string,
//   collection: string,
//   filter: any,
//   cb: (any) => any,
// ): void => {
//   cache["dbs"][dbSymbol].collection(collection).deleteMany(filter, err => {
//     if (err) {
//       log.WARN("Error during deleting data.");
//       return cb(err);
//     }
//     updateCache(dbSymbol);
//     log.INFO(
//       `Succesfully deleted data from ${dbSymbol.toUpperCase()}.${collection.toUpperCase()} collection.`,
//     );
//     return cb(null);
//   });
// };

// const findCollection = (database, collection, cb) =>
//   database
//     .collection(collection)
//     .find({})
//     .toArray((err, data) => cb(err, data));
