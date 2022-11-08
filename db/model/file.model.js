//use mongoose ODM and file schema
const mongoose = require("mongoose");
const { model } = mongoose;
const { FileSchema } = require("../schema/file.schema");

const File = model("files", FileSchema);
//Create file model - find one file by id, create one file
class FileModel {
  async findById(fileId) {
    const file = await File.findOne({ _id: fileId });
    return file;
  }

  async createFile(fileInfo) {
    const createdFile = await File.create(fileInfo);
    return createdFile;
  }
}
module.exports = FileModel;
