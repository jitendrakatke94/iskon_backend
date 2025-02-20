"use strict"
import Cryptr from 'cryptr';
import Bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const parseErrors = async (validationErrors) =>{
    let errors = [];
    console.log(validationErrors)
    validationErrors.forEach(error => {
      errors.push({
        key: error.keyword,
        message: error.message,
        param: (function() {
          return error.keyword === 'minLength' ? error.instancePath.replace("/","") : error.params["missingProperty"]
        })() 
      });
    });
  
    return errors;
}

const logger = (TAG,msg)=>{
    console.log(`${TAG}: ${msg}`);
}

const getEncrypt = (value)=>{
  const cryptr = new Cryptr(process.env.CRYPTR_KEY); //Server Secret Key
  return cryptr.encrypt(value);
};

const getDecrypt = (value)=>{
  console.log("new decrypt: ", value);
  const cryptr = new Cryptr(process.env.CRYPTR_KEY); //Server Secret Key
  return cryptr.decrypt(value);
};

const getHashPassword = (value)=>{
  return Bcrypt.hashSync(value, 8); //8=saltRounds
};

const isCompared = (value,testValue)=>{
  return Bcrypt.compareSync(testValue, value); //8=saltRounds and returns true or false
};

const getToken = (object) => {
  return jwt.sign(object, process.env.JWT_KEY, {
    expiresIn: 3600, // expires in 24 hours
  });
};

const verifyToken = async (token) => {
  return await jwt.verify(token, process.env.JWT_KEY);
};

const pagination = async (limit, page) => {
  try {
    let current = page ? Number(page) : 1;
    let pageSizeData = limit ? Number(limit) : 10;
    let offset = Number(current - 1) * pageSizeData;
    return { offset, pageSizeData };
  } catch (error) {
    console.log("Error in pagination", error.message);
    throw error;
  }
};

export {
  parseErrors,
  logger,
  isCompared,
  getDecrypt,
  getEncrypt,
  getHashPassword,
  getToken,
  verifyToken,
  pagination,
} 
