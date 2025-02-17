"use strict";
import mysql from "mysql";
import {logger} from "./commonRepo.js"
import ResponseModel from "./responseObj.js"

const pool= mysql.createPool({
    connectionLimit: 1000, //important
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'iskon',
    debug: false,
    multipleStatements: true,
    charset: 'utf8mb4'
});
console.log(pool);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
const dbHandler = (query)=>{
    return new Promise((res,rej)=>{
        //logger("Process env: ",process.env.DB_USER)
        pool.getConnection(function (err, connection) {
            if (err) {
                logger("ERROR QUERY 1",err.message);
                rej(new ResponseModel(false,err.message,undefined));
            } else {
                logger('connected as id ', connection.threadId);
                logger("QUERY",query);
                connection.query(query, function (err, rows) {
                    connection.release();
                    err?rej(new ResponseModel(false,err.message,undefined)):res(new ResponseModel(true,"Success",rows));
                });
                connection.on('error', function (err) {
                    logger("ERROR QUERY 2",err.message);
                    rej(new ResponseModel(false,err.message,undefined))
                });
            }
        });
    })
}

const query = async (query)=>{
    try{
        return await dbHandler(query)
    }catch(e){
        logger("ERROR DB",e.message);
        throw e;
    }
}

const insert = async (table, insertData) => {
    var keys = Object.keys(insertData);
    var keyValue = "";
    var insertItem = "";
    for (var i = 0; i < keys.length; i++) {
        keyValue = keyValue + keys[i] + ",";
        if (typeof insertData[keys[i]] === 'string') {
            let insertItem2 = insertData[keys[i]];
            insertItem2 = insertItem2.replace(/'/g, "\\'");
            insertItem2 = insertItem2.replace(/"/g, '\\"');
            insertItem = insertItem + "'" + insertItem2 + "'" + ",";
        } else {
            insertItem = insertItem + insertData[keys[i]] + ",";
        }

    }
    if (keyValue.charAt(keyValue.length - 1) == ',') {
        keyValue = keyValue.substr(0, keyValue.length - 1);
    }
    if (insertItem.charAt(insertItem.length - 1) == ',') {
        insertItem = insertItem.substr(0, insertItem.length - 1);
    }
    try{
        return await dbHandler(`INSERT INTO ${table} (${keyValue}) VALUES (${insertItem})`)
    }catch(e){
        logger("ERROR DB",e.message);
        throw e;
    }
};

const updateQuery = async (table, updateData, whereData) => {
    var keys = Object.keys(updateData);
    var updateString = "";
    for (var i = 0; i < keys.length; i++) {
        if (typeof updateData[keys[i]] === 'string') {
            let insertItem2 = updateData[keys[i]];
            insertItem2 = insertItem2.replace(/'/g, "\\'");
            insertItem2 = insertItem2.replace(/"/g, '\\"');

            updateString = updateString + keys[i] + "='" + insertItem2 + "',";
        } else {
            updateString = updateString + keys[i] + "=" + updateData[keys[i]] + ",";
        }
    }
    if (updateString.charAt(updateString.length - 1) == ',') {
        updateString = updateString.substr(0, updateString.length - 1);
    }

    var keys = Object.keys(whereData);
    var whereString = "";
    for (var i = 0; i < keys.length; i++) {
        if (typeof whereData[keys[i]] === 'string') {
            whereString = whereString + keys[i] + "='" + whereData[keys[i]] + "' AND ";
        } else {
            whereString = whereString + keys[i] + "=" + whereData[keys[i]] + " AND ";
        }
    }
    var checkValue = whereString.substr((whereString.length - 5), whereString.length);
    if (checkValue == ' AND ') {
        whereString = whereString.substr(0, whereString.length - 5);
    }
    try{
        return await dbHandler("UPDATE " + table + " SET " + updateString + " WHERE " + whereString);
    }catch(e){
        logger("ERROR DB",e.message);
        throw e;
    }
};

export {
    query,
    insert,
    updateQuery
} 
 
