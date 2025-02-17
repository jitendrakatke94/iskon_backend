'use strict' 
class ResponseModel { 
   constructor(status, message,response) { 
        this.status=status;
        this.message=message;
        this.response=response;
   } 
   print() { 
      return {
        status:this.status,
        message:this.message,
        response:this.response
      }
   } 
} 

export default ResponseModel