import { Router } from "express";

const userRouter = Router();
 userRouter.get('/profile', ( req,res) =>  res.send( {title: "Get All Users "}));
  userRouter.get('/:id', ( req,res) =>  res.send( {title: "Get User details "}));
 userRouter.post('/', ( req,res) =>  res.send( {title: "Create new User "}));
 userRouter.put('/:id', ( req,res) =>  res.send( {title: "UPDATE user details "}));
 userRouter.delete('/:id', ( req,res) =>  res.send( {title: " Delete User "}));


export default userRouter;