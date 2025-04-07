
import * as bcrypt from 'bcrypt';
import {customAlphabet} from "nanoid"

const saltOrRounds = 10;
const password = 'random_password';


export const createPasswordHash =async(password:string)=> await bcrypt.hash(password, saltOrRounds);


export const comparePasswordWithHash =async(password:string,hash:string)=> await bcrypt.compare(password, hash);

export const generateToken=(length:number)=> customAlphabet("0123456789")(length)
