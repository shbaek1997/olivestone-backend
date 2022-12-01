import joi from "joi";

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
    "string.min": "파일 비밀번호는 최소 4글자 이상이어야 합니다.",
  }),
  passwordRepeat: joi.any().equal(joi.ref("password")).required().messages({
    "any.only": "파일 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
  }),
});

// const fileUploadJoiSchema =

export { fileIdJoiSchema, fileDownloadJoiSchema, filePasswordUpdateJoiSchema };
