import bcrypt, { hash } from 'bcrypt'


var hashTest
var passwordTest

// to do: add exception handling to both functions



//uses a random salt
//need to figure out how to verify it then, but it is very secure as hashes generated are 
//always different -> cant reverse lookup in a common hash table

// hashes the password 2^10 times -> makes bruteforcing difficult and slow for hackers
// needs to be slow enough for brute forcing to be difficult, but not too slow so user interaction isnt slow
// around 10 is a good number(around 100ms time taken)


async function storePassword(password){
    console.log(password)
    passwordTest = password
    var hash = await bcrypt.hash(password,10)
    hashTest = hash
    console.log(hash);
    //var bla = await bcrypt.compare(password,hash)
    checkPassword()
}

//give the user and password, check if the password is correct in the database, allow user
//log in or not based on result



async function checkPassword(){
    var correctPassword = passwordTest
    var wrongPassword = "WRONG"

    var correctResult = await bcrypt.compare(correctPassword,hashTest)
    var wrongResult = await bcrypt.compare(wrongPassword,hashTest)
    console.log("Correct password returns " + correctResult)
    console.log("Wrong password returns "+ wrongResult)
}




storePassword("ABC")


