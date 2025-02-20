import ResponseModel from "../db/responseObj.js"
import {logger, getHashPassword, getEncrypt, verifyToken, isCompared, getToken } from "../db/commonRepo.js";
import {query, insert} from "../db/db_connection.js";

const login = async (req, res) => {
    let reqBody=req.body;
    let response={}
    try {
        let userList = await query(`SELECT * FROM users WHERE email='${reqBody.email}'`);
        if(userList.status&&userList.response.length!=0){
            if(isCompared(userList.response[0].password_hash, reqBody.password)){
              let token = await getToken({
                email: userList.response[0].email,
                id: userList.response[0].id,
              });
              response = new ResponseModel(true,"Success",{token:token,id:userList.response[0].id,name:userList.response[0].name, role:userList.response[0].role});
            }else{
              response = new ResponseModel(false,"INCORRECT PASSWORD",{message:`Incorrect password`});
            }
        }else{
            response = new ResponseModel(false,"INVALID USERNAME",{message:`Invalid Username`}); 
        }
    }catch(error){
    response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}

const registartion= async (req, res) => {
    
    let reqBody=req.body;
    let response={}
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    try {
      let listOfUser = await query(`SELECT * FROM users WHERE email ='${reqBody.email}'`);
      if(listOfUser.status && listOfUser.response.length>0){
        response = new ResponseModel(false,"EMAIL ALREADY IN USE",{message:`Email # Already in use`});
      }else{
          reqBody.password_hash=getHashPassword(reqBody.password_hash);
          await insert(`users`,reqBody);
          response = new ResponseModel(true,"SUCCESS",{message:"User created Successfullly"});
      }
    } catch (error) {
	    console.log(error);
        logger("ERROR",error.message);
        response = new ResponseModel(false,"FAILED",{message:error.message});
    }
  res.status(200).json(response.print());
}
  
const userList = async (req, res) => {
    let reqBody=req.query;
    let response={};
    try {
      var userList = await query(`SELECT users.name as username, users.email, users.role,events.title as event_name FROM users left join event_registrations on event_registrations.user_id=users.id left join events on events.id=event_registrations.event_id `);
      if(!userList.status||userList.response.length==0){
          response = new ResponseModel(false,"ERROR",{message:`Invalid Data`});
      }else{
          response=new ResponseModel(true,'SUCCESS',userList.response);
      }
    }catch(error){
        response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}

const tokenVerify = async (req, res, next) => {
  let response = {};
  let token;
  console.log('jjjj', req.headers.authorization)
  if (req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "");
    
  } else {
    response = new ResponseModel(false, "User not verify 22", {
      message: "Authentication failed",
    });
    return res.status(401).json(response.print());
  }

  try {
    if (!token) {
        response = new ResponseModel(false, "User is not verify", {
        message: "Authentication failed",
      });
      return res.status(401).json(response.print());
    } else {
      console.log('user');
      const userId = await verifyToken(token);
      console.log('userId', userId);
      if (userId) {
        const queryString = `SELECT * FROM users where id = ${userId.id}`;
        const userDetails = await query(queryString);
        console.log("userDetails:", userDetails);
        if (userDetails.response.length > 0) {
          req.user = userId;
          next();
        }
      }
    }
  } catch (error) {
    response = new ResponseModel(false, "User not verify333", {
      message: "Authentication failed",
    });
    return res.status(401).json(response.print());
  }
};
export {
    login,
    registartion,
    userList,
    tokenVerify
} 