const joi = require("joi");
//check file upload - file password, password repeat, valid period
const userRegisterJoiSchema = joi.object({
  email: joi.string().required().email().messages({
    "string.empty": " email이 비어있습니다.",
    "any.required": "email은 반드시 입력되어야 합니다.",
    "string.email": "email이 올바른 형식이 아닙니다.",
  }),
  fullname: joi.string().required().min(2).messages({
    "string.empty": "아름이 비어있습니다.",
    "any.required": "이름은 반드시 입력되어야 합니다.",
    "string.min": "이름은 최소 2글자 이상이어야 합니다.",
  }),
  password: joi.string().required().min(8).messages({
    "string.empty": "비밀번호가 비어있습니다.",
    "any.required": "비밀번호는 반드시 입력되어야 합니다.",
    "string.min": "비밀번호는 최소 8글자 이상이어야 합니다.",
  }),
  passwordRepeat: joi.any().equal(joi.ref("password")).required().messages({
    "any.only": "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
  }),
  //관리자로 유저 추가가 필요하면 나중에 추가..
});

module.exports = { userRegisterJoiSchema };
