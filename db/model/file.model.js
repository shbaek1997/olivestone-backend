//use mongoose ODM and file schema
const mongoose = require("mongoose");
const { model } = mongoose;
const { FileSchema } = require("../schema/file.schema");

const File = model("files", FileSchema);
//Create file model - find one file by id, create one file
class FileModel {
  //find file by file id
  async findById(fileId) {
    const file = await File.findOne({ _id: fileId });
    return file;
  }
  //create new file
  async createFile(fileInfo) {
    const createdFile = await File.create(fileInfo);
    return createdFile;
  }
  //find all files in db
  async findAll() {
    const files = await File.find({});
    return files;
  }

  //find one file by file id, and update file with new hashed password
  async updateFilePassword(fileId, fileHashedPassword) {
    const filter = { _id: fileId };
    const update = { password: fileHashedPassword };
    const updatedFile = await File.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedFile;
  }
  //find one file by file id and update expiration date to today to make file expired
  async updateFileExpireDate(fileId, expireDate) {
    const filter = { _id: fileId };
    const update = { expireDate };
    const updatedFile = await File.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedFile;
  }
  async updateUserFilesExpireDates(userEmail, expireDate) {
    const filter = { uploaderEmail: userEmail };
    const update = { expireDate };
    const result = await File.updateMany(filter, update);
    return result;
  }
}
module.exports = FileModel;
