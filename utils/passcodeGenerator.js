import { errorMessage } from "../error";

let passcodes = []

export const generatePasscode = (userID) => {
  
  let passcodeGenerated = generateCode();
  /*
  let obj = {
    user_id: '123123',
    passcode: 1234123
  }
  */
  passcodes.push({
    user_id: userID,
    passcode: passcodeGenerated
  });

  return passcodeGenerated
}

function generateCode(){
  let decimal = Math.random() * (9999-1) + 1;
  let round = Math.trunc(decimal);

  let str = round.toString();

  return str.padStart(4, "0"); 
}



export const getUserPasscode = (userID) => {
  // find the relevant user by user id
  let passcode = passcodes.find(x => x.user_id === userID)?.passcode;

  return passcode;

}

export const refreshUserPasscode = (userID) => {
  // create new passcode and change it

  let newPasscode = generateCode();

  for (var i in passcodes) {
    if (passcodes[i].user_id === userID) {
      passcodes[i].passcode = newPasscode;
      return newPasscode
    }
  }
  errorMessage(); //run if we coulnt find it 
}

export const verifyPasscode = (userID,passcode) => {
  let passcodeMatches = false;

  for (var i in passcodes) {
    if (passcodes[i].user_id === userID) {
      if(Number(passcodes[i].passcode) === passcode){
        passcodeMatches = true;
      }
      break;//no point checking further as user_id is unique
    }
  }
  
  return passcodeMatches
}

export const getAllPasscodes = () => passcodes