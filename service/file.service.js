const FileModel = require("../db/model/file.model");
const bcrypt = require("bcrypt");
const fileModel = new FileModel();

class FileService {
  constructor(fileModel) {
    this.fileModel = fileModel;
  }
  async saveFile(fileInfo) {
    const { originalname, password, mimetype, filename, path } = fileInfo;
    const id = filename.slice(-24);
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newFileInfo = {
      _id: id,
      originalName: originalname,
      path,
      password: hashedPassword,
      mimeType: mimetype,
    };
    console.log(newFileInfo);
    const savedFile = await this.fileModel.createFile(newFileInfo);
    console.log(savedFile);
    return savedFile;
  }
}
const fileService = new FileService(fileModel);
module.exports = { fileService };
