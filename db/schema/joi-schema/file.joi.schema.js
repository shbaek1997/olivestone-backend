const joi = require("joi");

//check file id format using regex
const fileIdJoiSchema = joi.object({
  fileId: joi
    .string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "파일 아이디가 비어있습니다.",
      "any.required": "파일 아이디는 반드시 입력되어야 합니다.",
      "string.pattern.base": "파일 아이디 형식이 올바르지 않습니다.",
    }),
});

//check file download- file id and password format
const fileDownloadJoiSchema = joi.object({
  fileId: joi
    .string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "파일 아이디가 비어있습니다.",
      "any.required": "파일 아이디는 반드시 입력되어야 합니다.",
      "string.pattern.base": "파일 아이디 형식이 올바르지 않습니다.",
    }),
  password: joi.string().required().messages({
    "string.empty": "파일 비밀번호가 비어있습니다.",
    "any.required": "파일 비밀번호는 반드시 입력되어야 합니다.",
  }),
});

//check file password change - file id, password, password repeat
const filePasswordUpdateJoiSchema = joi.object({
  fileId: joi
    .string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "파일 아이디가 비어있습니다.",
      "any.required": "파일 아이디는 반드시 입력되어야 합니다.",
      "string.pattern.base": "파일 아이디 형식이 올바르지 않습니다.",
    }),
  password: joi.string().required().min(8).messages({
    "string.empty": "파일 비밀번호가 비어있습니다.",
    "any.required": "파일 비밀번호는 반드시 입력되어야 합니다.",
    "string.min": "파일 비밀번호는 최소 8글자 이상이어야 합니다.",
  }),
  passwordRepeat: joi.any().equal(joi.ref("password")).required().messages({
    "any.only": "파일 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
  }),
});

//check file upload - file password, password repeat, valid period
const fileUploadJoiSchema = joi.object({
  password: joi.string().required().min(8).messages({
    "string.empty": "파일 비밀번호가 비어있습니다.",
    "any.required": "파일 비밀번호는 반드시 입력되어야 합니다.",
    "string.min": "파일 비밀번호는 최소 8글자 이상이어야 합니다.",
  }),
  passwordRepeat: joi.any().equal(joi.ref("password")).required().messages({
    "any.only": "파일 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
  }),
  validPeriod: joi.number().required().min(1).messages({
    "any.required": "유효 기한은 반드시 입력해야 합니다.",
    "number.min": "유효 기한은 최소 하루입니다.",
  }),
});

module.exports = {
  fileIdJoiSchema,
  fileDownloadJoiSchema,
  filePasswordUpdateJoiSchema,
  fileUploadJoiSchema,
};
