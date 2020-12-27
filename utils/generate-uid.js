/*
 *  Very simple random UID generator.
 */

const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

exports.generateUID = (length) => {
  let uid = '';

  for(let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    let randomCharacter = characters.charAt(randomIndex);

    uid = uid.concat(randomCharacter);
  }

  return uid;
}
