
let passcodes = []

export const generatePasscode = (userID) => {
  
  let passcode = generateCode();
  /*
  let obj = {
    user_id: '123123',
    passcode: 1234123
  }
  */

  // passcodes.push(obj)
}

function generateCode(){
  console.log(Math.random() * (9999-1) + 1);
  return Math.random() * (9999-1) + 1; 
}



export const getUserPasscode = (userID) => {
  // find the relevant user by user id
  let passcode = passcodes.find(x => x.user_id === userID).passcode;

  return passcode;

}

export const refreshUserPasscode = (userID) => {
  // create new passcode and change it

}

export const getAllPasscodes = () => passcodes