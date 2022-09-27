import express, { Request, Response } from "express";
import moment from "moment";
import UserModel from "../models/users";

moment().format();


// import { createUser, findAndUpdate, findUser, deleteUser } from '../services/users.service';

const allUsers = async (req: Request, res: Response) => {

  let skip =  0;
  let limit =  10;


  let myData = await UserModel.find().skip(skip).limit(limit);
  res.json({
    message: "Users Page",
    myData: myData,
  });
};

const createPerson = async (req: Request, res: Response) => {
  try {
    const { name, classNumber, email, password, phone, dob, photo } = req.body;

    const dateIn = req.body.dob;
    // const newDate = dateIn.Date.parse();
    console.log('doooooooo', req.body.dob);

    const newDate = moment.utc( dateIn, "DD/MM/YYYY").toDate()

    // console.log('newwwwwwwwww', newDate);
    
    console.log('typeeeeee of neww--------', typeof(newDate));

    const userData = {
      name: req.body.name,
      classNumber: req.body.classNumber,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      dob: newDate,
      photo: req.body.photo,
      
    }

    console.log('userdddddddddddd', userData);
    


    // var newDateObj: any = moment(tripData.pickupTime)
      // .add(tripData.estimatedTime / 60, "m")
      // .format(format1);
    
    

    const user = await UserModel.create(userData);

    // console.log("uuuuuu  user", user);

    res.status(201).json({ user: user._id, created: true });

  } catch (error) {
    console.log("errrrr", error);
    res.status(500).json({
      // message: "User email already exist",
      error,
      // errors,
      created: false,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    // console.log("idsssssssss", req.body);
    const { name, classNumber, email, password, phone, dob, photo } = req.body;

    const data = await UserModel.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "User profile updated successfully...", data: data });

  } catch (error) {
    console.log(error);
    res.status(500).send("Updation failed!!");
  }
};

const updateTheUser = async (req: Request, res: Response) => {

  try {
    console.log('updating userrr');
    
    const classNumber: any = req.query.classNumber;
    const name: any = req.query.name;

    const classNum = parseInt(classNumber) 
  
    // console.log('reaach', typeof(classNum));

    if (!classNum && !name ) {
      console.log("Please fill all the details....");
      res.status(500).send("Please fill all the details....");
    } else if ( !classNum ) {
      console.log("class null");
      res.status(500).send("Please provide the class number");
    } else if (!name ) {
      console.log("name null");
      res.status(500).send("Please provide the name");
    } else if (classNum && name) {

      // {"name": { "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }},
      const update = await UserModel.updateMany(
        { name: { $regex: name } , classNumber: classNum },
        { $inc: { classNumber: 1 } }
      ); 

      const updatedData = await UserModel.find(
        { name: { $regex: name } , classNumber: classNum+1 }
      )

      console.log('updatedddd', updatedData);
      
      res.json({message: "success. class incremented...", data: updatedData})
    }
 
  } catch (error) {
    res.status(500).send("Class not incremented. error!!!")
  }
    
};



const deletePerson = async (req: Request, res: Response) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.send("User deleted successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const searchUsers = async (req: Request, res: Response) => {

  try {
    let userData = req.body;
    let skip = userData.skip || 0;
    let limit = userData.limit || 10;
    let advanceQuery: any;
    advanceQuery = await createAdvanceQuery(userData);
    // console.log("advance query", advanceQuery);

    let finalQuery = {};
    // console.log(advanceQuery.finalFilterQuery);
    if (advanceQuery.finalFilterQuery) {
      finalQuery = JSON.parse(`{${advanceQuery.finalFilterQuery}}`);
    }
    // console.log(JSON.stringify(finalQuery));

    // let users = await UserModel.find(finalQuery).count();

    // console.log('ffffffffff', finalQuery);
    

    let users = await UserModel.find(finalQuery).skip(skip).limit(limit);
    // .sort({ createdAt: -1 })
    // .skip(skip).limit(limit);
    // return { users };

    console.log("uuuuusers", users);
    if (users.length == 0) {
      res.send("No users with this details!!!");
    } else {
      res.json({
        message: "success fetching",
        data: users,
      });
    }
  } catch (error) {
    console.log("errorrrrrrr", error);
    res.status(500).send(error);
  }
};


// function of searching users...................
function createAdvanceQuery(reqData: any) {
  return new Promise((res, rej) => {
    let appendQuery = "";

    let isEmpty = Object.values(reqData).every((x) => x === null || x === "");
    let objKeys = Object.keys(reqData);

    if (isEmpty) {
      res("");
      return;
    }

    for (let i = 0; i < objKeys.length; i++) {
      //  console.log('obbbbbbbbbb', objKeys[i]);
      //  console.log('occcccccccc', reqData[objKeys[i]]);

      if (
        reqData[objKeys[i]] != null &&
        reqData[objKeys[i]] != undefined
        // && objKeys[i] != "skip" && objKeys[i] != "limit" 
        // && objKeys[i] != "sort"
        //  && objKeys[i] != "orderBy"
      ) {
        if (objKeys[i] == "classNumber" && reqData[objKeys[i]] != "") {
          // console.log('qqqqqqqqq', reqData[objKeys[i]]);

          appendQuery += `"classNumber": { "$in":  ${reqData[objKeys[i]]} } ,`;
          // console.log('insideeeeee');
        } else if (objKeys[i] == "searchText" && reqData[objKeys[i]] != "") {
          // console.log('else if entered...');

          appendQuery += `"$or": [
            
            {"name": { "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }},
            {"email":{ "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }},
            {"phone":{ "$regex" : "${reqData[objKeys[i]]}", "$options": "i" }}
          
              ] ,`;
        }
      }
    }

    let n = appendQuery.lastIndexOf(",");
    let finalFilterQuery = appendQuery.slice(0, n);
    console.log(JSON.stringify(finalFilterQuery));
    res({ finalFilterQuery: finalFilterQuery });
  });
}

export {
  allUsers,
  createPerson,
  updateUser,
  updateTheUser,
  deletePerson,
  searchUsers,
};
