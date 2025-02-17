import ResponseModel from "../db/responseObj.js";
import {query, insert, updateQuery} from "../db/db_connection.js";
import moment from 'moment';

const getEvents = async (req, res) => {
    let reqBody=req.query;
    let response={};
    let clause=''
    if(reqBody.date ){
        clause= clause + ` and date = ${reqBody.date}`
    }
    if(reqBody.category){
        clause= clause + ` and category = ${reqBody.category}`
    }
    if(reqBody.location){
        clause= clause +` and location = ${reqBody.location}`
    }
    let limitOffset = '';
    // if(reqBody.limit && reqBody.skip){
        limitOffset= `LIMIT 20`
    // }
    try {
        // if(reqBody.user_role == 'admin') {
            var eventList = await query(`SELECT events.*, locations.name FROM events inner join locations on locations.id=events.location_id where deleted_at IS NULL ${clause} ${limitOffset}`);
            if(!eventList.status||eventList.response.length==0){
                response = new ResponseModel(false,"ERROR",{message:`Invalid Data`});
            }else{
                response=new ResponseModel(true,'SUCCESS',eventList.response);
            }
        // }else {
        //     response=new ResponseModel(true,'ERROR',{message: 'You dont have an acceess'});
        // }
    }catch(error){
        response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}

const addEvents = async (req, res) => {
    let reqBody=req.body;
    let response={}
    try {
        if(reqBody.user_role == 'admin') {
            var event = {
                'title': reqBody.title,
                'description':reqBody.description,
                'date': reqBody.date,
                'category':reqBody.category,
                'location_id': reqBody.location_id,
                'created_by': reqBody.user_id
            };
            var event = await insert(`events`,event);
            if(event.response.insertId){
                response = new ResponseModel(true,"SUCCESS",{message:"Event Created Successfullly", title: reqBody.title, description: reqBody.description, date: reqBody.date, category: reqBody.category, location_id: reqBody.location_id});
            }else{
                response = new ResponseModel(false,"ERROR",{message:`Invalid Data`});
            }
        }else {
            response=new ResponseModel(true,'ERROR',{message: 'You dont have an acceess'});
        }
    }catch(error){
        response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}
const updateEvent = async (req, res) => {
    let reqParam = req.query;
    console.log("reqParam", reqParam);
    let reqBody=req.body;
    let response={}
    try {
        if(reqBody.user_role == 'admin') {
            let updateSMSReport=await updateQuery("events",{title: reqBody.title, description: reqBody.description, date: reqBody.date, category: reqBody.category, location_id: reqBody.location_id},{id:reqParam.id})
            if(updateSMSReport.status){
                response = new ResponseModel(true,"SUCCESS",{message:"Event Updated Successfullly", title: reqBody.title, description: reqBody.description, date: reqBody.date, category: reqBody.category, location_id: reqBody.location_id});
            }else{
                response = new ResponseModel(false,"ERROR",{message:`Invalid Data`});
            }
        }else {
            response=new ResponseModel(true,'ERROR',{message: 'You dont have an acceess'});
        }
        
    }catch(error){
        response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}

const deleteEvent = async (req, res) => {
    let reqParam = req.query;
    let response={}
    try {
        // if(reqBody.user_role == 'admin') {
            let updateSMSReport=await updateQuery("events",{deleted_at: moment().format('yyyy-mm-dd:hh:mm:ss')},{id:reqParam.id})
            if(updateSMSReport.status){
                response = new ResponseModel(true,"SUCCESS",{message:"Event Deleted Successfullly"});
            }else{
                response = new ResponseModel(false,"ERROR",{message:`Invalid Data`});
            }
        // }else {
        //     response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
        // }
        
    }catch(error){
        response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}

const locations = async (req, res) => {
    let response={};
    try {
        var locationList = await query(`SELECT * FROM locations`);
        if(!locationList.status||locationList.response.length==0){
            response = new ResponseModel(false,"ERROR",{message:`Invalid Data`});
        }else{
            response=new ResponseModel(true,'SUCCESS',locationList.response);
        }
    }catch(error){
        response = new ResponseModel(false,"ERROR",{message:`${error.message}`});
    }
    res.status(200).json(response.print());
}

export {
    getEvents,
    addEvents,
    updateEvent,
    deleteEvent,
    locations
}