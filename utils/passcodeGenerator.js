
let passcodes = []

export const generatePasscode = () => {
  let obj = {
    user_id: '123123',
    passcode: 1234123
  }

  passcodes.push(obj)
}

export const getUserPasscode = (userID) => {
  // find the relevant passcode by user id
}

export const refreshUserPasscode = (userID) => {
  // create new passcode and change it
}

export const getAllPasscodes = () => passcodes